import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  short_description: string;
  thumbnail_url?: string;
  price: number;
  level: string;
  duration_hours: number;
  instructor_name?: string;
  rating?: number;
  student_count?: number;
}

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="aspect-video bg-muted relative">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/10">
              <span className="text-2xl font-bold text-primary/60">{course.title.charAt(0)}</span>
            </div>
          )}
          <Badge variant="secondary" className="absolute top-2 right-2">
            {course.level}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {course.short_description}
        </p>
        
        {course.instructor_name && (
          <p className="text-xs text-muted-foreground mb-2">
            by {course.instructor_name}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          {course.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{course.rating.toFixed(1)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{course.duration_hours}h</span>
          </div>
          {course.student_count && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{course.student_count}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">
            {course.price > 0 ? `$${course.price}` : 'Free'}
          </span>
        </div>
        <Button asChild size="sm">
          <Link to={`/courses/${course.id}`}>
            View Course
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};