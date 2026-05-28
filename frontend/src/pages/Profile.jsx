import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('activity');

  // Security check: If no user is logged in, boot them to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isStudent = user.role === 'student';

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-4 sm:px-8 font-sans animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-black text-text-primary">
            {isStudent ? 'Student Profile' : 'Faculty Profile'}
          </h1>
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="Search records..." className="bg-surface rounded-full py-2 pl-10 pr-4 text-sm text-text-primary shadow-neuro-inset focus:outline-none focus:ring-2 focus:ring-blue-500 border-none w-full sm:w-64" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Profile Card */}
          <div className="w-full lg:w-1/3">
            <div className="bg-surface rounded-[2rem] p-8 shadow-neuro-sm border border-text-muted/10 flex flex-col items-center">
              
              <div className="w-32 h-32 rounded-full shadow-neuro-inset bg-background flex items-center justify-center text-blue-600 font-black text-5xl mb-6 border-4 border-surface relative">
                {user.initial}
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-surface rounded-full shadow-sm"></div>
              </div>

              <h2 className="text-2xl font-bold text-text-primary mb-1">{user.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold mb-6 ${isStudent ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'}`}>
                {isStudent ? 'Active Student' : 'Active Faculty'}
              </span>

              <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-neuro-sm hover:brightness-110 active:scale-95 transition-all mb-8">
                Edit Profile
              </button>

              <div className="w-full flex flex-col gap-4 text-sm">
                <div className="bg-background rounded-xl p-4 shadow-neuro-inset">
                  <span className="block text-xs text-text-muted font-semibold mb-1">Email</span>
                  <span className="text-text-primary font-medium">{user.email}</span>
                </div>
                <div className="bg-background rounded-xl p-4 shadow-neuro-inset">
                  <span className="block text-xs text-text-muted font-semibold mb-1">{isStudent ? 'Student ID' : 'Faculty ID'}</span>
                  <span className="text-text-primary font-medium">{user.id}</span>
                </div>
                <div className="bg-background rounded-xl p-4 shadow-neuro-inset">
                  <span className="block text-xs text-text-muted font-semibold mb-1">Department</span>
                  <span className="text-text-primary font-medium">{user.department}</span>
                </div>
                {isStudent && (
                  <div className="bg-background rounded-xl p-4 shadow-neuro-inset flex justify-between">
                    <div>
                      <span className="block text-xs text-text-muted font-semibold mb-1">Lab Section</span>
                      <span className="text-text-primary font-medium">{user.labSection}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-text-muted font-semibold mb-1">Group</span>
                      <span className="text-text-primary font-medium">{user.group}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Stats and Tabbed Data */}
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
            
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-surface p-6 rounded-[1.5rem] shadow-neuro-sm border border-text-muted/5 flex flex-col">
                <span className="text-text-muted font-bold text-sm mb-2">{isStudent ? 'Completed Labs' : 'Active Sections'}</span>
                <span className="text-3xl font-black text-blue-600 mb-2">{isStudent ? '14' : '4'}</span>
                <div className="h-10 w-full bg-background rounded-lg shadow-neuro-inset overflow-hidden flex items-end gap-1 p-1">
                  {[40, 70, 50, 90, 60].map((h, i) => <div key={i} style={{height: `${h}%`}} className="bg-blue-400 flex-1 rounded-sm"></div>)}
                </div>
              </div>
              
              <div className="bg-surface p-6 rounded-[1.5rem] shadow-neuro-sm border border-text-muted/5 flex flex-col">
                <span className="text-text-muted font-bold text-sm mb-2">{isStudent ? 'Pending Tasks' : 'Submissions to Grade'}</span>
                <span className="text-3xl font-black text-purple-600 mb-2">{isStudent ? '2' : '45'}</span>
                <div className="h-10 w-full bg-background rounded-lg shadow-neuro-inset overflow-hidden flex items-end gap-1 p-1">
                  {[20, 30, 40, 20, 80].map((h, i) => <div key={i} style={{height: `${h}%`}} className="bg-purple-400 flex-1 rounded-sm"></div>)}
                </div>
              </div>

              <div className="bg-surface p-6 rounded-[1.5rem] shadow-neuro-sm border border-text-muted/5 flex flex-col">
                <span className="text-text-muted font-bold text-sm mb-2">{isStudent ? 'Study Hours' : 'Total Students'}</span>
                <span className="text-3xl font-black text-orange-500 mb-2">{isStudent ? '128' : '120'}</span>
                <div className="h-10 w-full bg-background rounded-lg shadow-neuro-inset overflow-hidden flex items-end gap-1 p-1">
                  {[80, 60, 90, 70, 100].map((h, i) => <div key={i} style={{height: `${h}%`}} className="bg-orange-400 flex-1 rounded-sm"></div>)}
                </div>
              </div>
            </div>

            {/* Bottom Tabbed Area */}
            <div className="bg-surface rounded-[2rem] p-6 sm:p-8 shadow-neuro-sm border border-text-muted/10 flex-1 flex flex-col">
              
              {/* Tabs */}
              <div className="flex gap-6 border-b border-text-muted/20 mb-6">
                <button 
                  onClick={() => setActiveTab('activity')}
                  className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'activity' ? 'text-blue-600' : 'text-text-muted hover:text-text-primary'}`}
                >
                  {isStudent ? 'Recent Submissions' : 'Upcoming Classes'}
                  {activeTab === 'activity' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-md"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('team')}
                  className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'team' ? 'text-blue-600' : 'text-text-muted hover:text-text-primary'}`}
                >
                  {isStudent ? 'Lab Group B202' : 'Pending Grades'}
                  {activeTab === 'team' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-md"></div>}
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex flex-col gap-4">
                
                {activeTab === 'activity' && isStudent && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl shadow-neuro-inset">
                      <div>
                        <p className="font-bold text-text-primary text-sm">OS Memory Allocation Algorithm</p>
                        <p className="text-xs text-text-muted">Submitted Oct 15 • 10:30 AM</p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/10 text-green-600 text-xs font-bold rounded-full">Graded</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl shadow-neuro-inset">
                      <div>
                        <p className="font-bold text-text-primary text-sm">Database Schema Design</p>
                        <p className="text-xs text-text-muted">Submitted Oct 22 • 09:15 AM</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 text-xs font-bold rounded-full">Pending</span>
                    </div>
                  </>
                )}

                {activeTab === 'team' && isStudent && (
                  <>
                    {['Kawsar Ahmed Fahim', 'Syed Faiaz Hossain', 'Md. Abu Sayem Pias'].map((teammate, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-background rounded-xl shadow-neuro-inset">
                        <div className="w-10 h-10 rounded-full bg-surface shadow-neuro-sm border border-text-muted/10 flex items-center justify-center font-bold text-blue-600 text-sm">
                          {teammate.charAt(0)}
                        </div>
                        <p className="font-bold text-text-primary text-sm">{teammate}</p>
                        <span className="ml-auto text-xs font-semibold text-text-muted">Teammate</span>
                      </div>
                    ))}
                  </>
                )}

                {activeTab === 'activity' && !isStudent && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl shadow-neuro-inset">
                      <div>
                        <p className="font-bold text-text-primary text-sm">Advanced Operating Systems - Sec A</p>
                        <p className="text-xs text-text-muted">Today • 11:00 AM - 12:30 PM</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-600 text-xs font-bold rounded-full">Scheduled</span>
                    </div>
                  </>
                )}

                {activeTab === 'team' && !isStudent && (
                  <div className="text-center p-8 text-text-muted text-sm font-medium">
                    Select a section to view pending grade reports.
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}