import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

function HomePage () {
    return (
        <MainLayout>
            <div className="bg-light p-5 mt-4 rounded-3">
                <h1 style={ { color: 'dark' } }>ផ្លូវ-The Street</h1>
                <p></p>
                <p>
                    សូមស្វាគមន៍មកកាន់កម្មវិធីកម្មង់ដោយផ្ទាល់ពីអតិថិជន។
                    លោកអ្នកអាចទំនាក់ទំនងសម្រាប់ព័ត៌មានបន្ថែមបានតាមរយៈ ៖
                </p>
                <p>លេខទូរស័ព្ទ 086679666, 078500203, 010526642</p>
                <p>Telegram,FaceBook Page: ផ្លូវ-The Street</p>
                <Link to="/pos" className="btn btn-primary">
                    ចុចត្រង់នេះដើម្បីធ្វើការកម្មង់
                </Link>
            </div>
        </MainLayout>
    );
}

export default HomePage;
