import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MessageSquare } from 'lucide-react';

const ProjectsPage = () => {
  const allProjects = useAppSelector(state => state.projects.allProjects);
  const projects = allProjects.filter(p => p.status === 'published');

  if (projects.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">No Projects Yet</h2>
          <p className="text-muted-foreground mb-8">
            Be the first to share your project and start the feedback exchange!
          </p>
          <Link to="/upload-project">
            <Button size="lg" className="gradient-primary text-white">
              Upload Your Project
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Browse Projects</h1>
        <p className="text-muted-foreground text-lg">
          Explore projects from fellow founders and provide valuable feedback
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={`/project/${project.id}`}>
              <Card className="overflow-hidden hover-lift cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                  {(() => {
                    // Use primary image from images array if available, otherwise use imageUrl
                    const displayImageUrl = 
                      project.images?.find(img => img.isPrimary)?.url || 
                      project.images?.[0]?.url || 
                      project.imageUrl;
                    
                    return displayImageUrl ? (
                      <img
                        src={displayImageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary/30">
                          {project.name.charAt(0)}
                        </span>
                      </div>
                    );
                  })()}
                  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {project.reviewsReceived.length}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-end text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      View Details
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
