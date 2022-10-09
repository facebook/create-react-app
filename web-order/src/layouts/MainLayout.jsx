import React from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MainLayout ({ children }) {
    return (
        <div>
            <header>
                <nav className="navbar navbar-light bg-primary">
                    <div className="container">
                        <Link to="/" className="navbar-brand">
                            ផ្លូវ-The Street POS
                        </Link>
                    </div>
                </nav>
            </header>
            <main>
                <div className="container mt-3">{ children }</div>
                <ToastContainer />
            </main>
        </div>
    );
}

export default MainLayout;
