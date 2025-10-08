"""
AP ELITE ATHENA - Módulos 8-18 (Continuação)
Perícia Digital, Interceptações, ERBs, IPED, Análise, Relatórios, Financeiro
"""

from super_erp import *

# ==================== MODULE 8: PERÍCIA DIGITAL ====================

@super_router.post("/forensics/upload-evidence")
async def upload_forensic_evidence(
    case_id: str = Form(...),
    evidence_type: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload digital evidence for forensic analysis"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Save file
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{file_id}{file_ext}"
    filepath = Path(f"/app/backend/evidence/{filename}")
    filepath.parent.mkdir(exist_ok=True, parents=True)
    
    async with aiofiles.open(filepath, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Calculate hash
    import hashlib
    file_hash = hashlib.sha256(content).hexdigest()
    
    evidence = {
        "id": file_id,
        "case_id": case_id,
        "evidence_type": evidence_type,
        "description": description,
        "filename": file.filename,
        "filepath": str(filepath),
        "file_hash": file_hash,
        "file_size": len(content),
        "status": "pending_analysis",
        "chain_of_custody": [{
            "action": "uploaded",
            "user_id": current_user["id"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.forensic_evidence.insert_one(evidence)
    
    return {"evidence_id": file_id, "hash": file_hash, "status": "uploaded"}

@super_router.get("/forensics/evidence")
async def list_forensic_evidence(
    case_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List forensic evidence"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    query = {}
    if case_id:
        query["case_id"] = case_id
    
    evidence = await db.forensic_evidence.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"evidence": evidence}

# ==================== MODULE 9 & 10: INTERCEPTAÇÕES TELEFÔNICAS E TELEMÁTICAS ====================

@super_router.post("/interceptions/create")
async def create_interception(interception: InterceptionCreate, current_user: dict = Depends(get_current_user)):
    """Create new interception order"""
    if not current_user or current_user.get("role") not in ["administrator", "investigator"]:
        raise HTTPException(status_code=403, detail="Investigator access required")
    
    interception_dict = interception.model_dump()
    interception_dict["id"] = str(uuid.uuid4())
    interception_dict["created_by"] = current_user["id"]
    interception_dict["status"] = "active"
    interception_dict["data_collected"] = []
    interception_dict["locations"] = []
    interception_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    interception_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.interceptions.insert_one(interception_dict)
    
    return {"interception_id": interception_dict["id"], "status": "active"}

@super_router.post("/interceptions/{interception_id}/add-data")
async def add_interception_data(
    interception_id: str,
    data_type: str = Form(...),
    content: str = Form(...),
    timestamp: str = Form(...),
    location_lat: Optional[float] = Form(None),
    location_lng: Optional[float] = Form(None),
    erb_id: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """Add intercepted data (phone call, SMS, data connection)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    data_entry = {
        "id": str(uuid.uuid4()),
        "data_type": data_type,
        "content": content,
        "timestamp": timestamp,
        "location": {
            "lat": location_lat,
            "lng": location_lng,
            "erb_id": erb_id
        },
        "added_by": current_user["id"],
        "added_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Update interception
    await db.interceptions.update_one(
        {"id": interception_id},
        {
            "$push": {"data_collected": data_entry},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    # Save location to PostgreSQL if coordinates provided
    if location_lat and location_lng and PGSessionLocal:
        pg_session = PGSessionLocal()
        try:
            location = InterceptionLocation(
                interception_id=interception_id,
                timestamp=datetime.fromisoformat(timestamp),
                latitude=location_lat,
                longitude=location_lng,
                erb_id=erb_id,
                location=f'POINT({location_lng} {location_lat})'
            )
            pg_session.add(location)
            pg_session.commit()
        except Exception as e:
            pg_session.rollback()
            print(f"Error saving location: {e}")
        finally:
            pg_session.close()
    
    return {"data_id": data_entry["id"], "saved": True}

@super_router.get("/interceptions/{interception_id}/analysis")
async def analyze_interception(interception_id: str, current_user: dict = Depends(get_current_user)):
    """Analyze interception data with timeline and location mapping"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    interception = await db.interceptions.find_one({"id": interception_id}, {"_id": 0})
    if not interception:
        raise HTTPException(status_code=404, detail="Interception not found")
    
    # Get locations from PostgreSQL
    locations = []
    if PGSessionLocal:
        pg_session = PGSessionLocal()
        try:
            locs = pg_session.query(InterceptionLocation).filter(
                InterceptionLocation.interception_id == interception_id
            ).all()
            locations = [{
                "timestamp": loc.timestamp.isoformat(),
                "lat": loc.latitude,
                "lng": loc.longitude,
                "erb_id": loc.erb_id
            } for loc in locs]
        finally:
            pg_session.close()
    
    # Analyze data
    total_calls = len([d for d in interception["data_collected"] if d["data_type"] == "call"])
    total_sms = len([d for d in interception["data_collected"] if d["data_type"] == "sms"])
    total_data = len([d for d in interception["data_collected"] if d["data_type"] == "data"])
    
    # Get unique contacts
    contacts = set()
    for data in interception["data_collected"]:
        if "contact" in data.get("content", ""):
            contacts.add(data["content"])
    
    return {
        "interception": interception,
        "statistics": {
            "total_calls": total_calls,
            "total_sms": total_sms,
            "total_data": total_data,
            "unique_contacts": len(contacts),
            "duration_days": (datetime.fromisoformat(interception["end_date"]) - 
                            datetime.fromisoformat(interception["start_date"])).days
        },
        "locations": locations,
        "timeline": sorted(interception["data_collected"], key=lambda x: x["timestamp"])
    }

# ==================== MODULE 11: EXTRAÇÃO DE DADOS ====================

@super_router.post("/data-extraction/start")
async def start_data_extraction(
    device_type: str = Form(...),
    device_id: str = Form(...),
    extraction_type: str = Form(...),
    case_id: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """Start data extraction from device"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    extraction = {
        "id": str(uuid.uuid4()),
        "device_type": device_type,
        "device_id": device_id,
        "extraction_type": extraction_type,
        "case_id": case_id,
        "status": "in_progress",
        "progress": 0.0,
        "extracted_data": {
            "contacts": [],
            "messages": [],
            "calls": [],
            "files": [],
            "apps": [],
            "locations": []
        },
        "started_by": current_user["id"],
        "started_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.data_extractions.insert_one(extraction)
    
    # TODO: Integrate with actual extraction tools (Cellebrite, UFED, Oxygen, etc)
    
    return {"extraction_id": extraction["id"], "status": "started"}

@super_router.get("/data-extraction/{extraction_id}")
async def get_extraction_status(extraction_id: str, current_user: dict = Depends(get_current_user)):
    """Get extraction status and results"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    extraction = await db.data_extractions.find_one({"id": extraction_id}, {"_id": 0})
    if not extraction:
        raise HTTPException(status_code=404, detail="Extraction not found")
    
    return extraction

# ==================== MODULE 12: ERBs (ESTAÇÕES RÁDIO BASE) ====================

@super_router.post("/erbs/create")
async def create_erb(erb: ERBCreate, current_user: dict = Depends(get_current_user)):
    """Create ERB (Cell Tower) record"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if not PGSessionLocal:
        raise HTTPException(status_code=503, detail="PostgreSQL not available")
    
    pg_session = PGSessionLocal()
    try:
        # Get address from coordinates using Google Maps
        try:
            reverse_geocode = gmaps.reverse_geocode((erb.latitude, erb.longitude))
            address = reverse_geocode[0]['formatted_address'] if reverse_geocode else erb.address
        except:
            address = erb.address
        
        new_erb = ERB(
            erb_id=erb.erb_id,
            name=erb.name,
            operator=erb.operator,
            technology=erb.technology,
            latitude=erb.latitude,
            longitude=erb.longitude,
            location=f'POINT({erb.longitude} {erb.latitude})',
            address=address,
            coverage_radius=erb.coverage_radius
        )
        
        pg_session.add(new_erb)
        pg_session.commit()
        pg_session.refresh(new_erb)
        
        return {
            "erb_id": new_erb.erb_id,
            "id": new_erb.id,
            "address": new_erb.address,
            "message": "ERB created successfully"
        }
    except Exception as e:
        pg_session.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating ERB: {str(e)}")
    finally:
        pg_session.close()

@super_router.get("/erbs/search")
async def search_erbs(
    lat: float,
    lng: float,
    radius_km: float = 5.0,
    operator: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Search ERBs near coordinates"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if not PGSessionLocal:
        raise HTTPException(status_code=503, detail="PostgreSQL not available")
    
    pg_session = PGSessionLocal()
    try:
        from sqlalchemy import func
        
        # Query ERBs within radius
        query = pg_session.query(ERB).filter(
            func.ST_DWithin(
                ERB.location,
                func.ST_MakePoint(lng, lat),
                radius_km * 1000  # Convert km to meters
            )
        )
        
        if operator:
            query = query.filter(ERB.operator == operator)
        
        erbs = query.all()
        
        results = [{
            "erb_id": erb.erb_id,
            "name": erb.name,
            "operator": erb.operator,
            "technology": erb.technology,
            "latitude": erb.latitude,
            "longitude": erb.longitude,
            "address": erb.address,
            "coverage_radius": erb.coverage_radius,
            "distance_km": round(
                func.ST_Distance(
                    ERB.location,
                    func.ST_MakePoint(lng, lat)
                ) / 1000, 2
            )
        } for erb in erbs]
        
        return {"erbs": results, "count": len(results)}
    finally:
        pg_session.close()

@super_router.get("/erbs/map-coverage")
async def get_erb_coverage_map(
    lat: float,
    lng: float,
    zoom: int = 15,
    current_user: dict = Depends(get_current_user)
):
    """Get map with ERB coverage visualization"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get nearby ERBs
    erbs_response = await search_erbs(lat, lng, radius_km=10.0, current_user=current_user)
    
    # Generate map URL with markers
    markers = []
    for erb in erbs_response["erbs"]:
        color = "red" if erb["operator"] == "Vivo" else "blue" if erb["operator"] == "Claro" else "green"
        markers.append(f"color:{color}|{erb['latitude']},{erb['longitude']}")
    
    map_url = f"https://maps.googleapis.com/maps/api/staticmap?center={lat},{lng}&zoom={zoom}&size=800x600"
    map_url += "&markers=" + "&markers=".join(markers)
    map_url += f"&key={os.environ.get('GOOGLE_MAPS_API_KEY')}"
    
    return {
        "map_url": map_url,
        "erbs": erbs_response["erbs"],
        "center": {"lat": lat, "lng": lng}
    }

# ==================== MODULE 13: IPED INTEGRATION ====================

@super_router.post("/iped/create-project")
async def create_iped_project(
    project_name: str = Form(...),
    case_id: str = Form(...),
    evidence_ids: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """Create IPED forensic project"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    project_id = str(uuid.uuid4())
    project_path = Path(f"/app/backend/iped_projects/{project_id}")
    project_path.mkdir(exist_ok=True, parents=True)
    
    # Create IPED directory structure
    (project_path / "evidence").mkdir(exist_ok=True)
    (project_path / "index").mkdir(exist_ok=True)
    (project_path / "export").mkdir(exist_ok=True)
    
    project = {
        "id": project_id,
        "project_name": project_name,
        "case_id": case_id,
        "evidence_ids": json.loads(evidence_ids),
        "project_path": str(project_path),
        "status": "created",
        "progress": 0.0,
        "iped_version": "4.1.4",
        "analyst_id": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.iped_projects.insert_one(project)
    
    return {"project_id": project_id, "path": str(project_path)}

# ==================== MODULE 14: PROCESSAMENTO DE EVIDÊNCIAS ====================

@super_router.post("/evidence/process/{evidence_id}")
async def process_evidence(evidence_id: str, current_user: dict = Depends(get_current_user)):
    """Start evidence processing"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    evidence = await db.forensic_evidence.find_one({"id": evidence_id}, {"_id": 0})
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    
    # Update status
    await db.forensic_evidence.update_one(
        {"id": evidence_id},
        {
            "$set": {
                "status": "processing",
                "processing_started": datetime.now(timezone.utc).isoformat()
            },
            "$push": {
                "chain_of_custody": {
                    "action": "processing_started",
                    "user_id": current_user["id"],
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            }
        }
    )
    
    # TODO: Integrate with actual processing tools
    
    return {"evidence_id": evidence_id, "status": "processing"}

# Continue with modules 15-18...

# ==================== PHONE & DATA INTERCEPTIONS - SPECIFIC ROUTES ====================

@super_router.get("/phone-interceptions")
async def get_phone_interceptions(current_user: dict = Depends(get_current_user)):
    """Get all phone interceptions"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    interceptions = await db.interceptions.find(
        {"interception_type": {"$in": ["phone", "voice", "call"]}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"interceptions": interceptions}

@super_router.post("/phone-interceptions/upload")
async def upload_phone_interception(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload phone interception audio file"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Validate file type
    allowed_types = ['.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac']
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Save file
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    filepath = Path(f"/app/backend/interceptions/phone/{filename}")
    filepath.parent.mkdir(exist_ok=True, parents=True)
    
    async with aiofiles.open(filepath, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Create interception record
    interception = {
        "id": file_id,
        "filename": file.filename,
        "filepath": str(filepath),
        "file_size": len(content),
        "interception_type": "phone",
        "status": "pending",
        "uploaded_by": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.interceptions.insert_one(interception)
    
    return {"interception_id": file_id, "status": "uploaded"}

@super_router.get("/data-interceptions")
async def get_data_interceptions(current_user: dict = Depends(get_current_user)):
    """Get all data interceptions"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    interceptions = await db.interceptions.find(
        {"interception_type": {"$in": ["data", "telematic", "digital"]}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"interceptions": interceptions}

@super_router.post("/data-interceptions/upload")
async def upload_data_interception(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload data interception file"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Validate file type
    allowed_types = ['.json', '.csv', '.xml', '.txt', '.zip', '.pcap']
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Save file
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    filepath = Path(f"/app/backend/interceptions/data/{filename}")
    filepath.parent.mkdir(exist_ok=True, parents=True)
    
    async with aiofiles.open(filepath, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Create interception record
    interception = {
        "id": file_id,
        "filename": file.filename,
        "filepath": str(filepath),
        "file_size": len(content),
        "interception_type": "data",
        "status": "pending",
        "uploaded_by": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }


# ==================== ENHANCED CLIENT MANAGEMENT APIs ====================

@super_router.get("/clients/enhanced")
async def get_enhanced_clients(current_user: dict = Depends(get_current_user)):
    """Get all clients with enhanced information"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    clients = await db.clients_enhanced.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"clients": clients}

@super_router.post("/clients/enhanced")
async def create_enhanced_client(client_data: dict, current_user: dict = Depends(get_current_user)):
    """Create client with complete information"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    client = {
        **client_data,
        "id": str(uuid.uuid4()),
        "created_by": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "files": {
            "documents": [],
            "processes": [],
            "media": {
                "audio": [],
                "video": [],
                "images": []
            }
        },
        "filesCount": 0
    }
    
    await db.clients_enhanced.insert_one(client)
    return {"client_id": client["id"], "message": "Cliente criado com sucesso"}

@super_router.get("/clients/{client_id}")
async def get_client_details(client_id: str, current_user: dict = Depends(get_current_user)):
    """Get complete client details"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    client = await db.clients_enhanced.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    return client

@super_router.post("/clients/{client_id}/files")
async def upload_client_files(
    client_id: str,
    category: str = Form(...),
    files: list[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload files to client folder"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    client = await db.clients_enhanced.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    uploaded_files = []
    base_path = Path(f"/app/backend/client_files/{client_id}/{category}")
    base_path.mkdir(exist_ok=True, parents=True)
    
    for file in files:
        file_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1]
        filename = f"{file_id}{file_ext}"
        filepath = base_path / filename
        
        async with aiofiles.open(filepath, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        file_info = {
            "id": file_id,
            "name": file.filename,
            "originalName": file.filename,
            "size": f"{len(content) / 1024:.1f} KB",
            "path": str(filepath),
            "uploadDate": datetime.now(timezone.utc).isoformat(),
            "uploadedBy": current_user["id"]
        }
        uploaded_files.append(file_info)
    
    # Update client record
    if category == "documents":
        await db.clients_enhanced.update_one(
            {"id": client_id},
            {"$push": {"files.documents": {"$each": uploaded_files}},
             "$inc": {"filesCount": len(uploaded_files)}}
        )
    elif category == "processes":
        await db.clients_enhanced.update_one(
            {"id": client_id},
            {"$push": {"files.processes": {"$each": uploaded_files}},
             "$inc": {"filesCount": len(uploaded_files)}}
        )
    elif category == "media":
        # Categorize by file type
        for file_info in uploaded_files:
            ext = file_info["originalName"].split('.')[-1].lower()
            if ext in ['mp3', 'wav', 'ogg', 'm4a']:
                await db.clients_enhanced.update_one(
                    {"id": client_id},
                    {"$push": {"files.media.audio": file_info},
                     "$inc": {"filesCount": 1}}
                )
            elif ext in ['mp4', 'avi', 'mov']:
                await db.clients_enhanced.update_one(
                    {"id": client_id},
                    {"$push": {"files.media.video": file_info},
                     "$inc": {"filesCount": 1}}
                )
            elif ext in ['jpg', 'jpeg', 'png', 'gif']:
                await db.clients_enhanced.update_one(
                    {"id": client_id},
                    {"$push": {"files.media.images": file_info},
                     "$inc": {"filesCount": 1}}
                )
    
    return {"uploaded": len(uploaded_files), "files": uploaded_files}

# ==================== ENHANCED COMMUNICATIONS APIs ====================

@super_router.get("/communications/contacts")
async def get_communication_contacts(current_user: dict = Depends(get_current_user)):
    """Get all contacts for messaging"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get all users except current user
    users = await db.users.find(
        {"id": {"$ne": current_user["id"]}},
        {"_id": 0, "id": 1, "name": 1, "email": 1, "role": 1}
    ).to_list(100)
    
    contacts = []
    for user in users:
        # Get last conversation
        conversation = await db.conversations.find_one(
            {"participants": {"$all": [current_user["id"], user["id"]]}},
            {"_id": 0}
        )
        
        unread_count = 0
        last_message = None
        
        if conversation:
            # Count unread messages
            unread_count = await db.messages.count_documents({
                "conversation_id": conversation["id"],
                "sender_id": {"$ne": current_user["id"]},
                "read": False
            })
            
            # Get last message
            last_msg = await db.messages.find_one(
                {"conversation_id": conversation["id"]},
                {"_id": 0},
                sort=[("timestamp", -1)]
            )
            if last_msg:
                last_message = last_msg.get("content", "")[:50]
        
        contacts.append({
            **user,
            "unreadCount": unread_count,
            "lastMessage": last_message
        })
    
    return {"contacts": contacts}

@super_router.get("/communications/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Get all conversations"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    conversations = await db.conversations.find(
        {"participants": current_user["id"]},
        {"_id": 0}
    ).to_list(100)
    
    return {"conversations": conversations}

@super_router.get("/communications/messages/{conversation_id}")
async def get_messages(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Get messages from a conversation"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    messages = await db.messages.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(500)
    
    # Mark messages as read
    await db.messages.update_many(
        {
            "conversation_id": conversation_id,
            "sender_id": {"$ne": current_user["id"]},
            "read": False
        },
        {"$set": {"read": True, "status": "read"}}
    )
    
    return {"messages": messages}

@super_router.post("/communications/send")
async def send_message(message_data: dict, current_user: dict = Depends(get_current_user)):
    """Send a message"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    conversation_id = message_data.get("conversationId")
    
    # Create conversation if doesn't exist
    if not conversation_id:
        recipient_id = message_data.get("recipientId")
        conversation = await db.conversations.find_one({
            "participants": {"$all": [current_user["id"], recipient_id]}
        })
        
        if not conversation:
            conversation_id = str(uuid.uuid4())
            await db.conversations.insert_one({
                "id": conversation_id,
                "participants": [current_user["id"], recipient_id],
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        else:
            conversation_id = conversation["id"]
    
    message = {
        "id": str(uuid.uuid4()),
        "conversation_id": conversation_id,
        "sender_id": current_user["id"],
        "sender": {
            "id": current_user["id"],
            "name": current_user.get("name", "User"),
            "email": current_user.get("email", "")
        },
        "content": message_data.get("content", ""),
        "type": message_data.get("type", "text"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "read": False,
        "status": "sent"
    }
    
    await db.messages.insert_one(message)
    
    return {"message_id": message["id"], "status": "sent"}

@super_router.post("/communications/upload")
async def upload_communication_files(
    conversationId: str = Form(...),
    files: list[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload files in chat"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    uploaded_files = []
    base_path = Path(f"/app/backend/chat_files/{conversationId}")
    base_path.mkdir(exist_ok=True, parents=True)
    
    for file in files:
        file_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1]
        filename = f"{file_id}{file_ext}"
        filepath = base_path / filename
        
        async with aiofiles.open(filepath, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Create message for file
        message = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversationId,
            "sender_id": current_user["id"],
            "sender": {
                "id": current_user["id"],
                "name": current_user.get("name", "User"),
                "email": current_user.get("email", "")
            },
            "content": f"Enviou um arquivo: {file.filename}",
            "type": "file",
            "fileName": file.filename,
            "filePath": str(filepath),
            "fileSize": f"{len(content) / 1024:.1f} KB",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "read": False,
            "status": "sent"
        }
        
        await db.messages.insert_one(message)
        uploaded_files.append(message)
    
    return {"uploaded": len(uploaded_files), "messages": uploaded_files}

@super_router.post("/communications/nudge")
async def send_nudge(data: dict, current_user: dict = Depends(get_current_user)):
    """Send attention nudge"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    conversation_id = data.get("conversationId")
    
    message = {
        "id": str(uuid.uuid4()),
        "conversation_id": conversation_id,
        "sender_id": current_user["id"],
        "sender": {
            "id": current_user["id"],
            "name": current_user.get("name", "User")
        },
        "content": "🔔 Chamou sua atenção!",
        "type": "nudge",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "read": False,
        "status": "sent"
    }
    
    await db.messages.insert_one(message)
    
    return {"nudge_sent": True}

@super_router.get("/communications/online-status")
async def get_online_status(current_user: dict = Depends(get_current_user)):
    """Get online users"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Update current user's last seen
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"last_seen": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Get users online in last 5 minutes
    five_min_ago = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
    online_users = await db.users.find(
        {"last_seen": {"$gte": five_min_ago}},
        {"_id": 0, "id": 1}
    ).to_list(100)
    
    return {"onlineUsers": [u["id"] for u in online_users]}

    
    await db.interceptions.insert_one(interception)
    
    return {"interception_id": file_id, "status": "uploaded"}

