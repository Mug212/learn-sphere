import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CourseCard } from '@/components/CourseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

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

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.short_description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:instructor_id (full_name),
          categories (name)
        `)
        .eq('is_published', true);

      if (error) throw error;

      const coursesWithInstructor = data.map(course => ({
        ...course,
        instructor_name: course.profiles?.full_name,
        rating: 4.5 + Math.random() * 0.5, // Mock rating
        student_count: Math.floor(Math.random() * 1000) + 50, // Mock student count
      }));

      setCourses(coursesWithInstructor);
      setFilteredCourses(coursesWithInstructor);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Explore All Courses</h1>
      
      <form onSubmit={handleSearch} className="mb-8 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-lg h-80"></div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search terms</p>
          <Button onClick={() => setSearchTerm('')}>Clear Search</Button>
        </div>
      )}
    </div>
  );
}