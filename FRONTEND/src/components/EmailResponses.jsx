import React, { useEffect, useState } from 'react';
import './EmailResponses.css';

const EmailResponses = () => {
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/responses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setResponses(data);
        } else {
          console.error('❌ Expected an array but got:', data);
          setResponses([]);
        }
      })
      .catch(err => {
        console.error('Error fetching responses:', err);
        setResponses([]);
      });
  }, []);

  return (
    <div className="email-container">
      <h1 className="email-title">📨 Client Email Responses</h1>

      {responses.length === 0 ? (
        <p className="no-responses">No responses yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="email-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Category</th>
                <th>Response</th>
                <th>Attachment</th>
                <th>Recipient</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((resp, index) => (
                <tr key={index} className="email-row">
                  <td>{resp.email}</td>
                  <td>{resp.category}</td>
                  <td>{resp.response_final}</td>
                  <td>
                    {resp.invoice_attached && resp.attachment_url ? (
                      <a
                        href={`http://localhost:5000${resp.attachment_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-link"
                      >
                        View
                      </a>
                    ) : (
                      'None'
                    )}
                  </td>
                  <td>{resp.recipient}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmailResponses;
