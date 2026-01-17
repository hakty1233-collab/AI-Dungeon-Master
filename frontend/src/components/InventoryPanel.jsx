import { useState } from 'react';
import { 
  useItem, 
  equipItem, 
  unequipItem, 
  removeItemFromInventory,
  getTotalWeight,
  getCarryingCapacity,
  ITEM_TYPES,
  ITEM_RARITY
} from '../utils/inventorySystem';

export default function InventoryPanel({ character, inventory, onUpdateCharacter, onUpdateInventory }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterType, setFilterType] = useState('all');

  const totalWeight = getTotalWeight(inventory);
  const capacity = getCarryingCapacity(character);
  const isOverEncumbered = totalWeight > capacity;

  const handleUseItem = (item) => {
    if (item.type === ITEM_TYPES.POTION) {
      const result = useItem(item, character);
      if (result.success) {
        // Update character HP
        onUpdateCharacter({
          ...character,
          hp: result.newHp
        });
        
        // Remove consumed potion
        onUpdateInventory(removeItemFromInventory(inventory, item.instanceId));
        
        alert(result.message);
        setSelectedItem(null);
      }
    }
  };

  const handleEquip = (item) => {
    const updatedChar = equipItem(character, item);
    onUpdateCharacter(updatedChar);
    
    // Mark item as equipped
    const updatedInventory = inventory.map(i => 
      i.instanceId === item.instanceId ? { ...i, equipped: true } : i
    );
    onUpdateInventory(updatedInventory);
    setSelectedItem(null);
  };

  const handleUnequip = (slot) => {
    const updatedChar = unequipItem(character, slot);
    onUpdateCharacter(updatedChar);
    
    // Mark item as unequipped
    const item = character.equippedItems[slot];
    if (item) {
      const updatedInventory = inventory.map(i => 
        i.instanceId === item.instanceId ? { ...i, equipped: false } : i
      );
      onUpdateInventory(updatedInventory);
    }
  };

  const handleDrop = (item) => {
    if (window.confirm(`Drop ${item.name}?`)) {
      onUpdateInventory(removeItemFromInventory(inventory, item.instanceId));
      setSelectedItem(null);
    }
  };

  const filteredInventory = filterType === 'all' 
    ? inventory 
    : inventory.filter(item => item.type === filterType);

  const getItemIcon = (type) => {
    const icons = {
      [ITEM_TYPES.WEAPON]: '⚔️',
      [ITEM_TYPES.ARMOR]: '🛡️',
      [ITEM_TYPES.SHIELD]: '🛡️',
      [ITEM_TYPES.POTION]: '🧪',
      [ITEM_TYPES.SCROLL]: '📜',
      [ITEM_TYPES.QUEST]: '✨',
      [ITEM_TYPES.MISC]: '📦',
      [ITEM_TYPES.ACCESSORY]: '💍'
    };
    return icons[type] || '📦';
  };

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      padding: '20px',
      border: '2px solid #444',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #444'
      }}>
        <h2 style={{ margin: 0, color: '#ffd700' }}>🎒 Inventory</h2>
        <div style={{
          fontSize: '14px',
          color: isOverEncumbered ? '#f44336' : '#4CAF50',
          fontWeight: 'bold'
        }}>
          {totalWeight} / {capacity} lbs
          {isOverEncumbered && ' ⚠️ ENCUMBERED'}
        </div>
      </div>

      {/* Equipment Slots */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#ffd700', fontSize: '16px', marginBottom: '10px' }}>
          ⚔️ Equipment
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px'
        }}>
          {['weapon', 'armor', 'shield'].map(slot => {
            const item = character.equippedItems?.[slot];
            return (
              <div
                key={slot}
                style={{
                  backgroundColor: '#2a2a2a',
                  padding: '15px',
                  borderRadius: '8px',
                  border: item ? '2px solid #ffd700' : '2px dashed #444',
                  textAlign: 'center',
                  minHeight: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  cursor: item ? 'pointer' : 'default'
                }}
                onClick={() => item && setSelectedItem(item)}
              >
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px', textTransform: 'uppercase' }}>
                  {slot}
                </div>
                {item ? (
                  <>
                    <div style={{ fontSize: '20px', marginBottom: '5px' }}>
                      {getItemIcon(item.type)}
                    </div>
                    <div style={{ fontSize: '13px', color: '#ffd700', fontWeight: 'bold' }}>
                      {item.name}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnequip(slot);
                      }}
                      style={{
                        marginTop: '8px',
                        padding: '4px 8px',
                        backgroundColor: '#d32f2f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      Unequip
                    </button>
                  </>
                ) : (
                  <div style={{ fontSize: '14px', color: '#666' }}>Empty</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & View Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '15px',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {['all', ITEM_TYPES.WEAPON, ITEM_TYPES.ARMOR, ITEM_TYPES.POTION, ITEM_TYPES.MISC].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '6px 12px',
                backgroundColor: filterType === type ? '#ffd700' : '#2a2a2a',
                color: filterType === type ? '#000' : '#eee',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px',
                textTransform: 'capitalize'
              }}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 12px',
              backgroundColor: viewMode === 'grid' ? '#ffd700' : '#2a2a2a',
              color: viewMode === 'grid' ? '#000' : '#eee',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ▦ Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '6px 12px',
              backgroundColor: viewMode === 'list' ? '#ffd700' : '#2a2a2a',
              color: viewMode === 'list' ? '#000' : '#eee',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ☰ List
          </button>
        </div>
      </div>

      {/* Inventory Items */}
      <div>
        <h3 style={{ color: '#ffd700', fontSize: '16px', marginBottom: '10px' }}>
          📦 Items ({filteredInventory.length})
        </h3>
        
        {filteredInventory.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#888',
            fontStyle: 'italic'
          }}>
            No items in this category
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '10px'
          }}>
            {filteredInventory.map(item => (
              <div
                key={item.instanceId}
                onClick={() => setSelectedItem(item)}
                style={{
                  backgroundColor: '#2a2a2a',
                  padding: '15px',
                  borderRadius: '8px',
                  border: item.equipped ? '2px solid #4CAF50' : selectedItem?.instanceId === item.instanceId ? '2px solid #ffd700' : '2px solid #444',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                  {getItemIcon(item.type)}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: item.rarity.color,
                  fontWeight: 'bold',
                  marginBottom: '4px'
                }}>
                  {item.name}
                </div>
                {item.quantity > 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    backgroundColor: '#ffd700',
                    color: '#000',
                    borderRadius: '10px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    x{item.quantity}
                  </div>
                )}
                {item.equipped && (
                  <div style={{
                    fontSize: '10px',
                    color: '#4CAF50',
                    marginTop: '4px'
                  }}>
                    ✓ Equipped
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredInventory.map(item => (
              <div
                key={item.instanceId}
                onClick={() => setSelectedItem(item)}
                style={{
                  backgroundColor: '#2a2a2a',
                  padding: '12px 15px',
                  borderRadius: '8px',
                  border: selectedItem?.instanceId === item.instanceId ? '2px solid #ffd700' : '2px solid #444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}
              >
                <div style={{ fontSize: '24px' }}>
                  {getItemIcon(item.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    color: item.rarity.color,
                    fontWeight: 'bold'
                  }}>
                    {item.name}
                    {item.quantity > 1 && ` (x${item.quantity})`}
                    {item.equipped && ' ✓'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {item.weight} lbs • {item.value} gp
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#1a1a1a',
            border: `3px solid ${selectedItem.rarity.color}`,
            borderRadius: '12px',
            padding: '25px',
            minWidth: '350px',
            maxWidth: '500px',
            zIndex: 10000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>
              {getItemIcon(selectedItem.type)}
            </div>
            <h3 style={{
              margin: '0 0 5px 0',
              color: selectedItem.rarity.color,
              fontSize: '24px'
            }}>
              {selectedItem.name}
            </h3>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
              {selectedItem.rarity.name} {selectedItem.type}
            </div>
            <p style={{
              margin: '15px 0',
              color: '#ccc',
              fontSize: '14px',
              fontStyle: 'italic'
            }}>
              {selectedItem.description}
            </p>
          </div>

          {/* Item Stats */}
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            {selectedItem.damage && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#888' }}>Damage: </span>
                <span style={{ color: '#ffd700', fontWeight: 'bold' }}>
                  {selectedItem.damage} {selectedItem.damageType}
                </span>
              </div>
            )}
            {selectedItem.ac && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#888' }}>AC: </span>
                <span style={{ color: '#ffd700', fontWeight: 'bold' }}>
                  {selectedItem.ac}
                </span>
              </div>
            )}
            {selectedItem.power && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#888' }}>Healing: </span>
                <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  {selectedItem.power}
                </span>
              </div>
            )}
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#888' }}>Weight: </span>
              <span style={{ color: '#eee' }}>{selectedItem.weight} lbs</span>
            </div>
            <div>
              <span style={{ color: '#888' }}>Value: </span>
              <span style={{ color: '#ffd700' }}>{selectedItem.value} gp</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            {selectedItem.type === ITEM_TYPES.POTION && (
              <button
                onClick={() => handleUseItem(selectedItem)}
                style={{
                  padding: '12px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🧪 Use Potion
              </button>
            )}
            
            {(selectedItem.type === ITEM_TYPES.WEAPON || 
              selectedItem.type === ITEM_TYPES.ARMOR || 
              selectedItem.type === ITEM_TYPES.SHIELD) && !selectedItem.equipped && (
              <button
                onClick={() => handleEquip(selectedItem)}
                style={{
                  padding: '12px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ⚔️ Equip
              </button>
            )}
            
            <button
              onClick={() => handleDrop(selectedItem)}
              style={{
                padding: '12px',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🗑️ Drop
            </button>
            
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                padding: '12px',
                backgroundColor: '#444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 9999
          }}
        />
      )}
    </div>
  );
}