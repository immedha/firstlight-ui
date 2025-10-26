import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { collection, query, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { db } from '@/firebase';

interface LeaderboardUser {
  id: string;
  displayName: string;
  karmaPoints: number;
  reviewCount: number;
}

const Leaderboard = () => {
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch all users
        const usersQuery = query(collection(db, 'users'));
        const userDocs = await getDocs(usersQuery);
        
        // Fetch all reviews for counting
        const reviewsQuery = query(collection(db, 'reviews'));
        const reviewDocs = await getDocs(reviewsQuery);
        
        // Count reviews by reviewer
        const reviewCounts = new Map<string, number>();
        reviewDocs.forEach(doc => {
          const data = doc.data();
          const reviewerId = data.reviewerId;
          if (reviewerId) {
            reviewCounts.set(reviewerId, (reviewCounts.get(reviewerId) || 0) + 1);
          }
        });
        
        // Build all users with their data
        const usersData: LeaderboardUser[] = [];
        userDocs.forEach(doc => {
          const data = doc.data();
          usersData.push({
            id: doc.id,
            displayName: data.displayName || 'Anonymous',
            karmaPoints: data.karmaPoints || 0,
            reviewCount: reviewCounts.get(doc.id) || 0,
          });
        });
        
        // Sort by karma descending and get top 3
        const topUsers = usersData
          .sort((a, b) => b.karmaPoints - a.karmaPoints)
          .slice(0, 3);

        setTopUsers(topUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return null;
  }
  
  if (topUsers.length === 0) {
    return null;
  }

  return (
    <Card className="p-3 border-primary/20 shadow-lg w-64">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="w-4 h-4 text-yellow-500" />
        <h3 className="font-semibold text-sm">Top Contributors</h3>
      </div>
      
      <div className="space-y-1.5">
        {topUsers.map((user, index) => (
          <div key={user.id} className="flex items-center gap-2 text-xs">
            <span className="font-medium text-primary shrink-0">
              #{index + 1}
            </span>
            <span className="truncate font-medium">{user.displayName}</span>
            <span className="ml-auto text-muted-foreground shrink-0">
              {user.karmaPoints} karma
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Leaderboard;

