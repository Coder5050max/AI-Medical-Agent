"use client"
import React,{useState} from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import CustomDialog from '@/app/_components/Dialog'
import { useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import Link from 'next/link';

function HistoryList() {
    const [historyList, setHistoryList] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [report, setReport] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await fetch('/api/users/session-chat');
                const data = await res.json();
                setHistoryList(Array.isArray(data) ? data : []);
            } catch (e) {
                setHistoryList([]);
            }
        }
        fetchHistory();
    }, []);

    const handleViewReport = async (session) => {
        setSelectedSession(session);
        setLoading(true);
        try {
            // Try to use the report if already present
            if (session.report) {
                setReport(session.report);
                setModalOpen(true);
                setLoading(false);
                return;
            }
            // Otherwise, fetch/generate the report
            const res = await fetch('/api/users/medical-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionID: session.sessionID, sessionDetail: session, messages: session.conversation || [], notes: session.notes })
            });
            const data = await res.json();
            setReport(data);
            setModalOpen(true);
        } catch (e) {
            setReport({ error: 'Failed to fetch report.' });
            setModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='mt-10'>
            {historyList.length === 0 ? (
                <div className='flex items-center flex-col justify-center p-7  border-dashed rounded-2xl border-2'>
                    <Image src={'/medical-assistance.png'} alt='empty' width={150} height={150} />
                    <h2 className='font-bold text-xl mt-2'>No Recent Consultation </h2>
                    <p>It looks like you haven\'t consulted with any doctors yet.</p>
                    <CustomDialog />
                </div>
            ) : (
                <div>
                    <table className='min-w-full text-left border rounded-lg overflow-hidden'>
                        <thead>
                            <tr className='bg-gray-100'>
                                <th className='py-2 px-4'>AI Medical Specialist</th>
                                <th className='py-2 px-4'>Description</th>
                                <th className='py-2 px-4'>Date</th>
                                <th className='py-2 px-4'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyList.map((session, idx) => (
                                <tr key={session.sessionID} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className='py-2 px-4 font-semibold'>{session.SelectedDoctor?.specialist || '-'}</td>
                                    <td className='py-2 px-4'>{session.notes || '-'}</td>
                                    <td className='py-2 px-4'>{session.createdOn ? timeAgo(session.createdOn) : '-'}</td>
                                    <td className='py-2 px-4'>
                                        <button className='underline cursor-pointer' onClick={() => handleViewReport(session)}>
                                            View Report
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className='text-center mt-4 text-gray-500'>Previous Consultation Reports</div>
                </div>
            )}
            {/* Modal for report */}
            {modalOpen && (
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30'>
                        <div className='bg-white p-6 rounded-lg max-w-lg w-full shadow-lg'>
                            <h3 className='font-bold text-lg mb-2'>Medical Report</h3>
                            {loading ? (
                                <div>Loading...</div>
                            ) : report && !report.error ? (
                                <pre className='whitespace-pre-wrap text-sm bg-gray-50 p-2 rounded'>{JSON.stringify(report, null, 2)}</pre>
                            ) : (
                                <div className='text-red-500'>{report?.error || 'No report available.'}</div>
                            )}
                            <div className='flex justify-end gap-2 mt-4'>
                                <button className='px-3 py-1 border rounded' onClick={() => setModalOpen(false)}>Close</button>
                                {selectedSession && (
                                    <Link href={`/dashboard/medical-agent/${selectedSession.sessionID}`} className='px-3 py-1 bg-blue-600 text-white rounded'>Go to Full Report</Link>
                                )}
                            </div>
                        </div>
                    </div>
                </Dialog>
            )}
        </div>
    );
}

// Helper to format time ago
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
}

export default HistoryList;
