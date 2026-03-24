// Dynamic course information page for /courses/[slug]/information
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { Course } from '@/types/admin';
import { CourseInfoDisplay } from '../../components/CourseInfoDisplay';
import { CourseEditForm } from '../../components/CourseEditForm';

// Map slug to program ID
const SLUG_TO_ID: Record<string, number> = {
  'thu-thach-30-ngay': 82,
  'la-chinh-minh': 57,
  'cuoc-song-cua-ban': 54,
};

export default function DynamicCourseInformationPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const COURSE_ID = SLUG_TO_ID[slug];
  const isMobile = useIsMobile();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tab, setTab] = useState<'info' | 'benefits' | 'mentors'>('info');

  const fetchCourse = useCallback(async () => {
    if (!COURSE_ID) return setLoading(false);
    const supabase = createClient();
    const result = await supabase
      .from('program')
      .select(`
        id,
        program_name,
        program_price,
        program_type,
        image,
        banner,
        hashtag,
        total_sessions,
        start_date,
        end_date,
        link_payment,
        course,
        status,
        highlight_program
      `)
      .eq('id', COURSE_ID)
      .single();
    const programData = result.data;
    const error = result.error;
    if (error) {
      console.error('Error fetching course:', error);
    }
    if (programData) {
      const descResult = await supabase
        .from('program_description')
        .select('short_description, topic, format')
        .eq('program_id', programData.id)
        .eq('lang_id', 1)
        .single();
      const descData = descResult.data;
      // Lấy membershipFee nếu có
      let membershipFee = undefined;
      try {
        const challengeResult = await supabase
          .from('program_30day_challenge')
          .select('membership_price')
          .eq('program_id', programData.id)
          .single();
        membershipFee = challengeResult.data?.membership_price;
      } catch {}
      setCourse({
        id: String(programData.id),
        title: programData.program_name || '',
        shortDescription: descData?.short_description || '',
        fee: programData.program_price || 0,
        membershipFee,
        thumbnailUrl: programData.image || '',
        thumbnailUrl_9_16: programData.banner || '',
        topic: programData.hashtag || descData?.topic || '',
        format: descData?.format || '',
        schedule: programData.total_sessions || '',
        startDate: programData.start_date ? new Date(programData.start_date) : undefined,
        endDate: programData.end_date ? new Date(programData.end_date) : undefined,
        location: programData.link_payment || '',
        studentCount: programData.course || 0,
        type: membershipFee ? 'Membership' : 'Course',
        status: programData.status === 1 ? 'published' : 'draft',
        isFeatured: programData.highlight_program === 1,
      });
    }
    setLoading(false);
  }, [COURSE_ID]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleUpdate = async (updatedCourse: Course) => {
    setCourse(updatedCourse);
    setIsEditing(false);
    await fetchCourse();
  };

  if (!COURSE_ID) {
    return <div className="p-8 text-center text-muted-foreground">Không tìm thấy khóa học</div>;
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          className={cn(
            "px-4 py-2 rounded-lg font-semibold",
            tab === 'info' ? 'bg-[#F7B418] text-white' : 'bg-gray-100 text-gray-700'
          )}
          onClick={() => setTab('info')}
        >
          Thông tin khóa học
        </button>
        <button
          className={cn(
            "px-4 py-2 rounded-lg font-semibold",
            tab === 'benefits' ? 'bg-[#F7B418] text-white' : 'bg-gray-100 text-gray-700'
          )}
          onClick={() => setTab('benefits')}
        >
          Lợi ích học viên
        </button>
        <button
          className={cn(
            "px-4 py-2 rounded-lg font-semibold",
            tab === 'mentors' ? 'bg-[#F7B418] text-white' : 'bg-gray-100 text-gray-700'
          )}
          onClick={() => setTab('mentors')}
        >
          Người dẫn đường
        </button>
      </div>
      {/* Tab content */}
      {tab === 'info' && (
        loading ? (
          <Card className={cn(isMobile ? "rounded-xl" : "rounded-lg")}> 
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !course ? (
          <Card className={cn(isMobile ? "rounded-xl" : "rounded-lg")}> 
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">Không tìm thấy thông tin khóa học</p>
            </CardContent>
          </Card>
        ) : (
          <Card className={cn(
            "border shadow-sm relative overflow-hidden",
            isMobile ? "rounded-xl" : "rounded-lg"
          )}>
            <CardContent className={cn(
              "relative",
              isMobile ? "p-4 pt-4" : "pt-6"
            )}>
              {/* Edit overlay */}
              {!isEditing && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <Button
                    size="lg"
                    onClick={() => setIsEditing(true)}
                    className="bg-[#F7B418] hover:bg-[#e5a616] text-gray-900 font-medium rounded-xl shadow-md px-6 py-3 h-auto"
                  >
                    <Edit className="mr-2 h-5 w-5" />
                    Chỉnh sửa
                  </Button>
                </div>
              )}
              {/* Content */}
              {isEditing ? (
                <CourseEditForm
                  course={course}
                  onUpdate={handleUpdate}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <CourseInfoDisplay course={course} />
              )}
            </CardContent>
          </Card>
        )
      )}
      {tab === 'benefits' && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
          <p>Chức năng Lợi ích học viên sẽ được bổ sung sau.</p>
        </div>
      )}
      {tab === 'mentors' && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
          <p>Chức năng Người dẫn đường sẽ được bổ sung sau.</p>
        </div>
      )}
    </div>
  );
}
