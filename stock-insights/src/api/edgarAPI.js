import axios from 'axios';

export const fetchFilings = async ticker => {
  try {
    const url = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}&type=10-K&dateb=&owner=exclude&count=1&output=atom`;
    const response = await axios.get(url);
    // Basic parsing logic to extract data from the response
    const parser = new DOMParser();
    const xml = parser.parseFromString(response.data, 'text/xml');
    const entry = xml.getElementsByTagName('entry')[0];
    const summary = entry.getElementsByTagName('summary')[0].textContent;
    return {
      tenKSummary: summary,
      earningsSummary: 'Quarterly earnings data not yet implemented',
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
