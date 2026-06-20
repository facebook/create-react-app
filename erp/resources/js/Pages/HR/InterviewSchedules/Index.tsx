import React from 'react';

interface InterviewSchedule {
    id: number;
    candidate_name: string;
    position_title: string;
    interview_type: string;
    status: string;
    scheduled_at: string;
    duration_minutes: number;
    location?: string;
    meeting_link?: string;
}

interface Props {
    interviews: {
        data: InterviewSchedule[];
        current_page: number;
        last_page: number;
    };
}

export default function Index({ interviews }: Props) {
    return (
        <div>
            <h1>Interview Schedules</h1>
            <ul>
                {interviews.data.map((interview) => (
                    <li key={interview.id}>
                        {interview.candidate_name} — {interview.position_title} ({interview.status})
                    </li>
                ))}
            </ul>
        </div>
    );
}
