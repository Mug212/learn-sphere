import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users, ArrowLeft } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  short_description: string;
  description: string;
  thumbnail_url?: string;
  price: number;
  level: string;
  duration_hours: number;
  instructor_name?: string;
  rating?: number;
  student_count?: number;
  categories?: { name: string }[];
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCourseDetails(id);
    }
  }, [id]);

  const fetchCourseDetails = async (courseId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:instructor_id (full_name),
          categories (name)
        `)
        .eq('id', courseId)
        .single();

      if (error) throw error;

      const courseWithDetails = {
        ...data,
        instructor_name: data.profiles?.full_name,
        rating: 4.7, // Mock rating
        student_count: Math.floor(Math.random() * 1000) + 50, // Mock student count
      };

      setCourse({
        ...courseWithDetails,
        categories: courseWithDetails.categories ? [courseWithDetails.categories].flat() : []
      });
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-80 bg-muted rounded mb-6"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-muted rounded w-full mb-1"></div>
          <div className="h-4 bg-muted rounded w-full mb-1"></div>
          <div className="h-4 bg-muted rounded w-3/4 mb-6"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <p className="mb-6">The course you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/courses">Browse All Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Link to="/courses" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to courses
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-6">
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/10">
                <span className="text-4xl font-bold text-primary/60">{course.title.charAt(0)}</span>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{course.short_description}</p>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <Badge variant="outline">{course.level}</Badge>
            {course.categories?.map(category => (
              <Badge key={category.name} variant="secondary">{category.name}</Badge>
            ))}
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
            {course.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{course.rating.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration_hours} hours</span>
            </div>
            {course.student_count && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.student_count} students</span>
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-semibold mb-4">About This Course</h2>
          <div className="prose max-w-none">
            <p>{course.description}</p>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-6">
            <div className="text-3xl font-bold mb-6">
              {course.price > 0 ? `$${course.price}` : 'Free'}
            </div>
            
            <Button className="w-full mb-4">Enroll Now</Button>
            
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">This course includes:</p>
              <ul className="space-y-2">
                <li>• {course.duration_hours} hours of content</li>
                <li>• Access on all devices</li>
                <li>• Certificate of completion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}