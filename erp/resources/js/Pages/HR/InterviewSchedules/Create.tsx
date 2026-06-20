import React from 'react';
import { useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, errors } = useForm({
        candidate_name: '',
        candidate_email: '',
        position_title: '',
        interview_type: 'in-person',
        scheduled_at: '',
        duration_minutes: 60,
        location: '',
        meeting_link: '',
        notes: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/interview-schedules');
    }

    return (
        <div>
            <h1>Schedule Interview</h1>
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
                <button type="submit">Schedule</button>
            </form>
        </div>
    );
}
