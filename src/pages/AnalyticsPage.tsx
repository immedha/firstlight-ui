import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { Card } from '@/components/ui/card';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { KARMA_CONFIG } from '@/lib/karmaConfig';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const AnalyticsPage = () => {
  const userId = useAppSelector(state => state.user.userId);
  const karmaPoints = useAppSelector(state => state.user.karmaPoints);
  const allReviews = useAppSelector(state => state.reviews.allReviews);
  const allProjects = useAppSelector(state => state.projects.allProjects);

  // Filter and sort reviews by date
  const myReviews = useMemo(() => {
    return allReviews
      .filter(review => review.reviewerId === userId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [allReviews, userId]);

  const userTier = KARMA_CONFIG.getTier(karmaPoints);

  // Build karma timeline
  const karmaTimeline = useMemo(() => {
    let currentKarma = KARMA_CONFIG.STARTING_KARMA;
    const timeline = [{ date: new Date().getTime(), karma: currentKarma }];
    
    myReviews.forEach(review => {
      if (review.reviewQuality > 0) {
        const karmaChange = KARMA_CONFIG.getKarmaChange(review.reviewQuality);
        currentKarma += karmaChange;
        timeline.push({
          date: new Date(review.createdAt).getTime(),
          karma: currentKarma
        });
      }
    });
    
    return timeline;
  }, [myReviews]);

  const maxKarma = Math.max(...karmaTimeline.map(t => t.karma), karmaPoints);
  const minKarma = Math.min(...karmaTimeline.map(t => t.karma), 0, KARMA_CONFIG.STARTING_KARMA);

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Please sign in to view your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Graph Section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl sm:text-2xl font-bold">Karma Points Over Time</h1>
              <div className="flex items-center gap-2">
                <Trophy className={`w-5 h-5 ${
                  userTier === 1 ? 'text-yellow-500' : userTier === 2 ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <div>
                  <div className="font-bold text-lg">{karmaPoints}</div>
                  <div className="text-xs text-muted-foreground">
                    {KARMA_CONFIG.getTierName(userTier)}
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-4">
              <div className="h-64 sm:h-80">
                {karmaTimeline.length > 1 ? (
                  <ChartContainer
                    config={{
                      karma: {
                        label: 'Karma Points',
                        color: 'hsl(var(--primary))',
                      },
                    }}
                    className="h-full w-full"
                  >
                    <LineChart data={karmaTimeline}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date"
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                        className="text-xs"
                      />
                      <YAxis 
                        className="text-xs"
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        labelFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="karma" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', r: 5, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                    <div>
                      <p className="text-sm mb-2">No karma changes yet</p>
                      <p className="text-xs">Review projects to see your karma progress</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Side Panel - Review List */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold mb-3">Reviews</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {myReviews.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    You haven't reviewed any projects yet.
                  </p>
                </Card>
              ) : (
                myReviews.map((review, index) => {
                  const project = allProjects.find(p => p.id === review.projectId);
                  const rating = review.reviewQuality;
                  const karmaChange = rating > 0 ? KARMA_CONFIG.getKarmaChange(rating) : 0;
                  const hasRating = rating > 0;

                  return (
                    <Card key={review.id} className="p-3">
                      <div className="space-y-2">
                        {project ? (
                          <Link to={`/product/${project.id}`} className="block group">
                            <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                              {project.name}
                            </h3>
                          </Link>
                        ) : (
                          <h3 className="font-medium text-sm">Unknown Project</h3>
                        )}
                        
                        {hasRating ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-xs ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${
                              karmaChange > 0 ? 'text-green-600' : karmaChange < 0 ? 'text-red-600' : 'text-muted-foreground'
                            }`}>
                              {karmaChange > 0 ? (
                                <>
                                  <TrendingUp className="w-3 h-3" />
                                  +{karmaChange}
                                </>
                              ) : karmaChange < 0 ? (
                                <>
                                  <TrendingDown className="w-3 h-3" />
                                  {karmaChange}
                                </>
                              ) : (
                                <>
                                  <Minus className="w-3 h-3" />
                                  0
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Not rated yet</p>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

