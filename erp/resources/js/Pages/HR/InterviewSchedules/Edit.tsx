import React from 'react';
import { useForm } from '@inertiajs/react';

interface InterviewSchedule {
    id: number;
    candidate_name: string;
    candidate_email?: string;
    position_title: string;
    interview_type: string;
    status: string;
    scheduled_at: string;
    duration_minutes: number;
    location?: string;
    meeting_link?: string;
    notes?: string;
}

interface Props {
    interview: InterviewSchedule;
}

export default function Edit({ interview }: Props) {
    const { data, setData, put, errors } = useForm({
        candidate_name: interview.candidate_name,
        candidate_email: interview.candidate_email ?? '',
        position_title: interview.position_title,
        interview_type: interview.interview_type,
        scheduled_at: interview.scheduled_at,
        duration_minutes: interview.duration_minutes,
        location: interview.location ?? '',
        meeting_link: interview.meeting_link ?? '',
        notes: interview.notes ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/hr/interview-schedules/${interview.id}`);
    }

    return (
        <div>
            <h1>Edit Interview Schedule</h1>
            <form onSubmit={submit}>
                <div>
                    <label>Candidate Name</label>
                    <input
                        type="text"
                        value={data.candidate_name}
                        onChange={(e) => setData('candidate_name', e.target.value)}
                    />
                    {errors.candidate_name && <span>{errors.candidate_name}</span>}
                </div>
                <div>
                    <label>Position Title</label>
                    <input
                        type="text"
                        value={data.position_title}
                        onChange={(e) => setData('position_title', e.target.value)}
                    />
                    {errors.position_title && <span>{errors.position_title}</span>}
                </div>
                <div>
                    <label>Scheduled At</label>
                    <input
                        type="datetime-local"
                        value={data.scheduled_at}
                        onChange={(e) => setData('scheduled_at', e.target.value)}
                    />
                    {errors.scheduled_at && <span>{errors.scheduled_at}</span>}
                </div>
                <button type="submit">Update</button>
            </form>
        </div>
    );
}
