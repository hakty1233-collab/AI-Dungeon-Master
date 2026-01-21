// frontend/src/components/QuestJournal.jsx
import { useState } from 'react';
import { QUEST_STATUS, QUEST_TYPES } from '../utils/questSystem';

export default function QuestJournal({ quests, onUpdateQuest, onCompleteQuest, onClose }) {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedQuest, setSelectedQuest] = useState(null);

  const activeQuests = quests.filter(q => q.status === QUEST_STATUS.ACTIVE);
  const completedQuests = quests.filter(q => q.status === QUEST_STATUS.COMPLETED);
  const failedQuests = quests.filter(q => q.status === QUEST_STATUS.FAILED);

  const displayQuests = activeTab === 'active' ? activeQuests :
                        activeTab === 'completed' ? completedQuests : failedQuests;

  const getQuestTypeIcon = (type) => {
    const icons = {
      [QUEST_TYPES.MAIN]: '⭐',
      [QUEST_TYPES.SIDE]: '📜',
      [QUEST_TYPES.PERSONAL]: '💭',
      [QUEST_TYPES.FACTION]: '🏰',
      [QUEST_TYPES.BOUNTY]: '💰'
    };
    return icons[type] || '📋';
  };

  const getStatusColor = (status) => {
    const colors = {
      [QUEST_STATUS.ACTIVE]: '#ffd700',
      [QUEST_STATUS.COMPLETED]: '#4CAF50',
      [QUEST_STATUS.FAILED]: '#f44336',
      [QUEST_STATUS.ABANDONED]: '#888'
    };
    return colors[status] || '#888';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      padding: '20px',
      overflow: 'auto'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '15px',
        border: '3px solid #ffd700',
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '2px solid #444',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#ffd700' }}>📖 Quest Journal</h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '15px 20px',
          borderBottom: '2px solid #444',
          backgroundColor: '#0a0a0a'
        }}>
          <button
            onClick={() => setActiveTab('active')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'active' ? '#ffd700' : '#2a2a2a',
              color: activeTab === 'active' ? '#000' : '#eee',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: activeTab === 'active' ? 'bold' : 'normal'
            }}
          >
            📋 Active ({activeQuests.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'completed' ? '#4CAF50' : '#2a2a2a',
              color: activeTab === 'completed' ? '#fff' : '#eee',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: activeTab === 'completed' ? 'bold' : 'normal'
            }}
          >
            ✓ Completed ({completedQuests.length})
          </button>
          <button
            onClick={() => setActiveTab('failed')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'failed' ? '#f44336' : '#2a2a2a',
              color: activeTab === 'failed' ? '#fff' : '#eee',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: activeTab === 'failed' ? 'bold' : 'normal'
            }}
          >
            ✗ Failed ({failedQuests.length})
          </button>
        </div>

        {/* Content */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Quest List */}
          <div style={{
            width: '40%',
            borderRight: '2px solid #444',
            overflowY: 'auto',
            padding: '15px'
          }}>
            {displayQuests.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#888',
                fontStyle: 'italic'
              }}>
                No {activeTab} quests
              </div>
            ) : (
              displayQuests.map(quest => (
                <div
                  key={quest.id}
                  onClick={() => setSelectedQuest(quest)}
                  style={{
                    padding: '15px',
                    marginBottom: '10px',
                    backgroundColor: selectedQuest?.id === quest.id ? '#2a2a2a' : '#1a1a1a',
                    border: selectedQuest?.id === quest.id ? '2px solid #ffd700' : '2px solid #444',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: getStatusColor(quest.status)
                    }}>
                      {getQuestTypeIcon(quest.type)} {quest.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#888',
                      backgroundColor: '#0a0a0a',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      Lvl {quest.level}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>
                    {quest.giver}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#888' }}>
                    {quest.objectives.filter(o => o.completed).length}/{quest.objectives.length} objectives
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quest Details */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px'
          }}>
            {selectedQuest ? (
              <div>
                <h3 style={{ margin: '0 0 15px 0', color: '#ffd700' }}>
                  {getQuestTypeIcon(selectedQuest.type)} {selectedQuest.title}
                </h3>
                
                <div style={{
                  padding: '15px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #444'
                }}>
                  <div style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.6' }}>
                    {selectedQuest.description}
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                    Quest Giver: {selectedQuest.giver}
                  </div>
                </div>

                {/* Objectives */}
                <h4 style={{ color: '#ffd700', marginBottom: '10px' }}>Objectives</h4>
                <div style={{ marginBottom: '20px' }}>
                  {selectedQuest.objectives.map((obj, i) => (
                    <div
                      key={obj.id}
                      style={{
                        padding: '12px',
                        marginBottom: '8px',
                        backgroundColor: obj.completed ? '#1a3a1a' : '#2a2a2a',
                        border: obj.completed ? '1px solid #4CAF50' : '1px solid #444',
                        borderRadius: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          fontSize: '18px',
                          color: obj.completed ? '#4CAF50' : '#888'
                        }}>
                          {obj.completed ? '✓' : '○'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '14px',
                            color: obj.completed ? '#4CAF50' : '#eee',
                            textDecoration: obj.completed ? 'line-through' : 'none'
                          }}>
                            {obj.description}
                          </div>
                          {obj.required > 1 && (
                            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                              Progress: {obj.progress}/{obj.required}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rewards */}
                <h4 style={{ color: '#ffd700', marginBottom: '10px' }}>Rewards</h4>
                <div style={{
                  padding: '15px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #444'
                }}>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {selectedQuest.rewards.xp > 0 && (
                      <div>
                        <span style={{ color: '#888' }}>XP:</span>{' '}
                        <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                          +{selectedQuest.rewards.xp}
                        </span>
                      </div>
                    )}
                    {selectedQuest.rewards.gold > 0 && (
                      <div>
                        <span style={{ color: '#888' }}>Gold:</span>{' '}
                        <span style={{ color: '#ffd700', fontWeight: 'bold' }}>
                          {selectedQuest.rewards.gold}
                        </span>
                      </div>
                    )}
                    {selectedQuest.rewards.items?.length > 0 && (
                      <div>
                        <span style={{ color: '#888' }}>Items:</span>{' '}
                        <span style={{ color: '#2196F3' }}>
                          {selectedQuest.rewards.items.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {selectedQuest.status === QUEST_STATUS.ACTIVE && (
                  <button
                    onClick={() => onCompleteQuest(selectedQuest.id)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                  >
                    ✓ Mark as Complete
                  </button>
                )}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#888',
                fontStyle: 'italic'
              }}>
                Select a quest to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}