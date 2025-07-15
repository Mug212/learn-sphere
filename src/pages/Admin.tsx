import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  short_description: string;
  description: string;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  is_published: boolean;
}

export default function Admin() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: '',
    short_description: '',
    description: '',
    price: 0,
    level: 'beginner',
    duration_hours: 1,
    is_published: false
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error fetching courses',
        description: error.message
      });
      return;
    }

    setCourses((data as Course[]) || []);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!newCourse.title || !newCourse.description || !newCourse.short_description) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    const price = parseFloat(newCourse.price as any);
    if (isNaN(price) || price < 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Price',
        description: 'Price must be a non-negative number.',
      });
      return;
    }

    const duration_hours = parseInt(newCourse.duration_hours as any, 10);
    if (isNaN(duration_hours) || duration_hours <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Duration',
        description: 'Duration must be a positive number of hours.',
      });
      return;
    }

    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to create a course.',
      });
      return;
    }

    const { error } = await supabase
      .from('courses')
      .insert({
        title: newCourse.title,
        short_description: newCourse.short_description,
        description: newCourse.description,
        level: newCourse.level,
        is_published: newCourse.is_published,
        price: price,
        duration_hours: duration_hours,
        instructor_id: user.data.user.id,
      });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error creating course',
        description: error.message,
      });
      return;
    }

    toast({
      title: 'Course created successfully',
      description: 'The new course has been added to the database.',
    });

    setNewCourse({
      title: '',
      short_description: '',
      description: '',
      price: 0,
      level: 'beginner',
      duration_hours: 1,
      is_published: false,
    });

    fetchCourses();
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Course Administration</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                name="title"
                value={newCourse.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Short Description</label>
              <Input
                name="short_description"
                value={newCourse.short_description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Full Description</label>
              <Textarea
                name="description"
                value={newCourse.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <Input
                  type="number"
                  name="price"
                  value={newCourse.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Duration (hours)</label>
                <Input
                  type="number"
                  name="duration_hours"
                  value={newCourse.duration_hours}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <Select
                value={newCourse.level}
                onValueChange={(value) => handleSelectChange('level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit">Add Course</Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Existing Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{course.short_description}</p>
              <div className="flex items-center justify-between text-sm">
                <span>Price: ${course.price}</span>
                <span>Level: {course.level}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}