import { useState, useEffect, useMemo } from 'react';
import { DashboardItem } from '../../domain/entities/dashboard-item.entity';
import { GetDashboardItemsUseCase } from '../../domain/usecases/get-dashboard-items.usecase';
import { DashboardRepository } from '../../data/repositories/dashboard.repository';

const repository = new DashboardRepository();
const getDashboardItemsUseCase = new GetDashboardItemsUseCase(repository);

export const useDashboard = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'inquiries'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    const fetchItems = async () => {
      try {
        const result = await getDashboardItemsUseCase.execute();
        setItems(result);
      } catch (error) {
        console.error("Failed to fetch dashboard items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Filtered items based on activeTab and searchTerm
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesTab = activeTab === 'all' || item.type === activeTab;
      const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.subject && item.subject.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [items, activeTab, searchTerm]);

  // Count items per category
  const counts = useMemo(() => {
    const all = items.length;
    const requests = items.filter(item => item.type === 'requests').length;
    const inquiries = items.filter(item => item.type === 'inquiries').length;
    return { all, requests, inquiries };
  }, [items]);

  const [visibleCount, setVisibleCount] = useState(2);

  // Reset pagination on tab change or search
  useEffect(() => {
    setVisibleCount(2);
  }, [activeTab, searchTerm]);

  // Sliced items for display
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const loadMore = () => setVisibleCount(prev => prev + 2);
  const showLess = () => setVisibleCount(2);
  const hasMore = filteredItems.length > visibleCount;
  const canShowLess = visibleCount > 2;

  return {
    isMounted,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filteredItems,
    visibleItems,
    counts,
    isLoading,
    loadMore,
    showLess,
    hasMore,
    canShowLess
  };
};
