import React from 'react';
import { Region } from 'frint-react';

const Home = ({ authUser }) => <Region name="greeter" data={{ authUser }} />;

export default Home;
