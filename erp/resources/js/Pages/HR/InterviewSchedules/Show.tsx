import React from 'react';

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
    feedback?: string;
    outcome?: string;
}

interface Props {
    interview: InterviewSchedule;
}

export default function Show({ interview }: Props) {
    return (
        <div>
            <h1>Interview Schedule: {interview.candidate_name}</h1>
            <p>Position: {interview.position_title}</p>
            <p>Type: {interview.interview_type}</p>
            <p>Status: {interview.status}</p>
            <p>Scheduled At: {interview.scheduled_at}</p>
            <p>Duration: {interview.duration_minutes} minutes</p>
            {interview.location && <p>Location: {interview.location}</p>}
            {interview.meeting_link && <p>Meeting Link: {interview.meeting_link}</p>}
            {interview.notes && <p>Notes: {interview.notes}</p>}
            {interview.outcome && <p>Outcome: {interview.outcome}</p>}
            {interview.feedback && <p>Feedback: {interview.feedback}</p>}
        </div>
    );
}
