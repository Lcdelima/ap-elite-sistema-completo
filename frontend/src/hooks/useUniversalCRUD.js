import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * Universal CRUD Hook
 * Provides standardized data fetching and CRUD operations for all modules
 */
export const useUniversalCRUD = (collection) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all items
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/api/athena/${collection}/list`);
      setItems(response.data.data || []);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching ${collection}:`, error);
      setError(`Erro ao carregar dados`);
      toast.error(`Erro ao carregar dados`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create new item
  const createItem = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/athena/${collection}/create`, {
        collection,
        data
      });
      
      toast.success('Item criado com sucesso!');
      await fetchItems(); // Refresh list
      return response.data.data;
    } catch (error) {
      console.error(`Error creating ${collection} item:`, error);
      toast.error('Erro ao criar item');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update item
  const updateItem = async (id, data) => {
    try {
      setLoading(true);
      const response = await axios.put(`${BACKEND_URL}/api/athena/${collection}/${id}`, {
        collection,
        data
      });
      
      toast.success('Item atualizado com sucesso!');
      await fetchItems(); // Refresh list
      return response.data.data;
    } catch (error) {
      console.error(`Error updating ${collection} item:`, error);
      toast.error('Erro ao atualizar item');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/api/athena/${collection}/${id}`);
      
      toast.success('Item deletado com sucesso!');
      await fetchItems(); // Refresh list
    } catch (error) {
      console.error(`Error deleting ${collection} item:`, error);
      toast.error('Erro ao deletar item');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchItems();
  }, [collection]);

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  };
};

export default useUniversalCRUD;
