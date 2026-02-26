// frontend/src/components/ShopModal.jsx
import { useState, useMemo } from 'react';
import {
  getBuyPrice,
  getSellPrice,
  buyItem,
  sellItem,
  getGold,
  formatGold,
  RARITY_ORDER
} from '../utils/merchantSystem';
import { ITEM_TYPES, ITEM_RARITY } from '../utils/inventorySystem';

const RARITY_COLORS = {
  Common:    '#aaa',
  Uncommon:  '#4CAF50',
  Rare:      '#2196F3',
  Epic:      '#9C27B0',
  Legendary: '#ffd700'
};

const TYPE_ICONS = {
  [ITEM_TYPES.WEAPON]:    '⚔️',
  [ITEM_TYPES.ARMOR]:     '🛡️',
  [ITEM_TYPES.SHIELD]:    '🛡️',
  [ITEM_TYPES.POTION]:    '⚗️',
  [ITEM_TYPES.SCROLL]:    '📜',
  [ITEM_TYPES.ACCESSORY]: '💍',
  [ITEM_TYPES.MISC]:      '🎒',
  [ITEM_TYPES.QUEST]:     '📋'
};

export default function ShopModal({ merchant, party, onUpdateParty, onUpdateMerchant, onClose }) {
  const [tab, setTab] = useState('buy');                    // 'buy' | 'sell'
  const [selectedBuyItem, setSelectedBuyItem] = useState(null);
  const [selectedSellItem, setSelectedSellItem] = useState(null);
  const [buyQty, setBuyQty] = useState(1);
  const [sellQty, setSellQty] = useState(1);
  const [activeCharIndex, setActiveCharIndex] = useState(0); // Which party member is shopping
  const [buyFilter, setBuyFilter] = useState('all');         // type filter for buy tab
  const [notification, setNotification] = useState(null);   // { message, success }

  const activeChar = party[activeCharIndex];
  const gold = getGold(activeChar);

  // ── Notification helper ──────────────────────────────────────────────────
  const showNotif = (message, success) => {
    setNotification({ message, success });
    setTimeout(() => setNotification(null), 2500);
  };

  // ── BUY tab: filtered & sorted merchant stock ─────────────────────────
  const buyStock = useMemo(() => {
    let items = merchant.stock;
    if (buyFilter !== 'all') items = items.filter(i => i.type === buyFilter);
    return [...items].sort((a, b) => {
      const ra = RARITY_ORDER[a.rarity?.name] ?? 0;
      const rb = RARITY_ORDER[b.rarity?.name] ?? 0;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });
  }, [merchant.stock, buyFilter]);

  // ── SELL tab: character inventory (excluding gold & quest items) ───────
  const sellInventory = useMemo(() => {
    return (activeChar.inventory || []).filter(
      i => i.id !== 'gold' && i.type !== ITEM_TYPES.QUEST
    );
  }, [activeChar.inventory]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleBuy = () => {
    if (!selectedBuyItem) return;
    const result = buyItem(activeChar, merchant, selectedBuyItem, buyQty);
    if (result.success) {
      const updatedParty = party.map((c, i) => i === activeCharIndex ? result.character : c);
      onUpdateParty(updatedParty);
      onUpdateMerchant(result.merchant);
      // If item was last in stock, deselect
      const remaining = result.merchant.stock.find(s => s.id === selectedBuyItem.id);
      if (!remaining) setSelectedBuyItem(null);
      setBuyQty(1);
    }
    showNotif(result.message, result.success);
  };

  const handleSell = () => {
    if (!selectedSellItem) return;
    const result = sellItem(activeChar, merchant, selectedSellItem, sellQty);
    if (result.success) {
      const updatedParty = party.map((c, i) => i === activeCharIndex ? result.character : c);
      onUpdateParty(updatedParty);
      setSelectedSellItem(null);
      setSellQty(1);
    }
    showNotif(result.message, result.success);
  };

  // ── Unique type filters available in current stock ─────────────────────
  const availableTypes = useMemo(() => {
    const types = new Set(merchant.stock.map(i => i.type));
    return ['all', ...Array.from(types)];
  }, [merchant.stock]);

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 6000, padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#111',
        border: '2px solid #c9a84c',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 40px rgba(201,168,76,0.3)',
        overflow: 'hidden'
      }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #333',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'linear-gradient(135deg, #1a1200 0%, #1a1a1a 100%)'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#c9a84c', fontSize: '22px' }}>
              {merchant.icon} {merchant.name}
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '13px' }}>
              {merchant.description}
            </p>
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#666' }}>
              Buys at {Math.round(merchant.sellMultiplier * 100)}% · Sells at {Math.round(merchant.buyMultiplier * 100)}%
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid #555',
              color: '#aaa', width: '36px', height: '36px',
              borderRadius: '50%', cursor: 'pointer', fontSize: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >✕</button>
        </div>

        {/* ── Character Selector + Gold ────────────────────────────────── */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid #2a2a2a',
          display: 'flex', alignItems: 'center', gap: '12px',
          flexWrap: 'wrap', backgroundColor: '#161616'
        }}>
          <span style={{ color: '#888', fontSize: '13px', whiteSpace: 'nowrap' }}>Shopping as:</span>
          {party.map((char, i) => (
            <button
              key={char.name}
              onClick={() => { setActiveCharIndex(i); setSelectedBuyItem(null); setSelectedSellItem(null); setBuyQty(1); setSellQty(1); }}
              style={{
                padding: '6px 14px',
                backgroundColor: i === activeCharIndex ? '#c9a84c' : '#2a2a2a',
                color: i === activeCharIndex ? '#000' : '#ccc',
                border: `1px solid ${i === activeCharIndex ? '#c9a84c' : '#444'}`,
                borderRadius: '20px', cursor: 'pointer', fontSize: '13px',
                fontWeight: i === activeCharIndex ? 'bold' : 'normal'
              }}
            >
              {char.name}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px' }}>💰</span>
            <span style={{
              color: gold > 0 ? '#ffd700' : '#888',
              fontSize: '18px', fontWeight: 'bold'
            }}>
              {formatGold(gold)}
            </span>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', borderBottom: '1px solid #2a2a2a',
          backgroundColor: '#161616'
        }}>
          {[
            { key: 'buy',  label: `🛒 Buy  (${merchant.stock.length})` },
            { key: 'sell', label: `💰 Sell (${sellInventory.length})` }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '12px',
                backgroundColor: tab === t.key ? '#1a1a1a' : 'transparent',
                color: tab === t.key ? '#c9a84c' : '#666',
                border: 'none',
                borderBottom: tab === t.key ? '2px solid #c9a84c' : '2px solid transparent',
                cursor: 'pointer', fontSize: '14px', fontWeight: tab === t.key ? 'bold' : 'normal',
                transition: 'all 0.15s'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Notification Banner ───────────────────────────────────────── */}
        {notification && (
          <div style={{
            padding: '10px 24px',
            backgroundColor: notification.success ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)',
            borderBottom: `1px solid ${notification.success ? '#4CAF50' : '#f44336'}`,
            color: notification.success ? '#81C784' : '#e57373',
            fontSize: '13px', textAlign: 'center'
          }}>
            {notification.success ? '✓' : '✗'} {notification.message}
          </div>
        )}

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

          {/* Left: Item List */}
          <div style={{
            width: '55%', borderRight: '1px solid #2a2a2a',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>

            {/* Type filter (buy tab only) */}
            {tab === 'buy' && (
              <div style={{
                padding: '10px 12px',
                borderBottom: '1px solid #2a2a2a',
                display: 'flex', gap: '6px', flexWrap: 'wrap',
                backgroundColor: '#161616'
              }}>
                {availableTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => { setBuyFilter(type); setSelectedBuyItem(null); }}
                    style={{
                      padding: '4px 10px', fontSize: '12px',
                      backgroundColor: buyFilter === type ? '#c9a84c' : '#2a2a2a',
                      color: buyFilter === type ? '#000' : '#aaa',
                      border: `1px solid ${buyFilter === type ? '#c9a84c' : '#444'}`,
                      borderRadius: '12px', cursor: 'pointer'
                    }}
                  >
                    {type === 'all' ? '🗂 All' : `${TYPE_ICONS[type] || '•'} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                  </button>
                ))}
              </div>
            )}

            {/* Item rows */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {tab === 'buy' && (
                buyStock.length === 0
                  ? <EmptyState message="No items match this filter." />
                  : buyStock.map(item => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        price={getBuyPrice(item, merchant)}
                        priceLabel="Buy"
                        gold={gold}
                        isSelected={selectedBuyItem?.id === item.id}
                        onClick={() => { setSelectedBuyItem(item); setBuyQty(1); }}
                        priceColor={getBuyPrice(item, merchant) <= gold ? '#4CAF50' : '#f44336'}
                        qty={item.quantity}
                      />
                    ))
              )}
              {tab === 'sell' && (
                sellInventory.length === 0
                  ? <EmptyState message="Nothing to sell." />
                  : sellInventory.map(item => (
                      <ItemRow
                        key={item.instanceId}
                        item={item}
                        price={getSellPrice(item, merchant)}
                        priceLabel="Sell"
                        gold={gold}
                        isSelected={selectedSellItem?.instanceId === item.instanceId}
                        onClick={() => { setSelectedSellItem(item); setSellQty(1); }}
                        priceColor="#ffd700"
                        qty={item.quantity}
                      />
                    ))
              )}
            </div>
          </div>

          {/* Right: Item Detail + Action */}
          <div style={{
            width: '45%', padding: '20px',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto', backgroundColor: '#161616'
          }}>
            {tab === 'buy' && selectedBuyItem && (
              <ItemDetail
                item={selectedBuyItem}
                price={getBuyPrice(selectedBuyItem, merchant)}
                priceLabel="Cost"
                gold={gold}
                qty={buyQty}
                maxQty={selectedBuyItem.quantity}
                onQtyChange={setBuyQty}
                onAction={handleBuy}
                actionLabel="Buy"
                actionColor="#4CAF50"
                canAfford={getBuyPrice(selectedBuyItem, merchant) * buyQty <= gold}
                merchant={merchant}
              />
            )}
            {tab === 'sell' && selectedSellItem && (
              <ItemDetail
                item={selectedSellItem}
                price={getSellPrice(selectedSellItem, merchant)}
                priceLabel="You Receive"
                gold={gold}
                qty={sellQty}
                maxQty={selectedSellItem.quantity || 1}
                onQtyChange={setSellQty}
                onAction={handleSell}
                actionLabel="Sell"
                actionColor="#ffd700"
                canAfford={true}
                merchant={merchant}
              />
            )}
            {((tab === 'buy' && !selectedBuyItem) || (tab === 'sell' && !selectedSellItem)) && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                color: '#444', fontSize: '14px', textAlign: 'center', gap: '12px'
              }}>
                <span style={{ fontSize: '48px', opacity: 0.3 }}>
                  {tab === 'buy' ? '🛒' : '💰'}
                </span>
                <p style={{ margin: 0 }}>
                  {tab === 'buy'
                    ? 'Select an item to see details and buy it.'
                    : 'Select an item from your inventory to sell.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ItemRow({ item, price, priceLabel, gold, isSelected, onClick, priceColor, qty }) {
  const rarityColor = RARITY_COLORS[item.rarity?.name] || '#aaa';
  const typeIcon = TYPE_ICONS[item.type] || '•';

  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 16px',
        cursor: 'pointer',
        backgroundColor: isSelected ? 'rgba(201,168,76,0.1)' : 'transparent',
        borderLeft: isSelected ? '3px solid #c9a84c' : '3px solid transparent',
        borderBottom: '1px solid #1e1e1e',
        display: 'flex', alignItems: 'center', gap: '10px',
        transition: 'background 0.1s'
      }}
    >
      <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{typeIcon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: rarityColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.name}
          {item.magical && <span style={{ marginLeft: '6px', fontSize: '10px', color: '#9C27B0' }}>✨</span>}
        </div>
        <div style={{ fontSize: '11px', color: '#555' }}>
          {item.rarity?.name}
          {qty > 1 && <span style={{ marginLeft: '8px', color: '#666' }}>×{qty}</span>}
        </div>
      </div>
      <div style={{
        fontSize: '13px', fontWeight: 'bold', color: priceColor,
        whiteSpace: 'nowrap'
      }}>
        {formatGold(price)}
      </div>
    </div>
  );
}

function ItemDetail({ item, price, priceLabel, gold, qty, maxQty, onQtyChange, onAction, actionLabel, actionColor, canAfford, merchant }) {
  const rarityColor = RARITY_COLORS[item.rarity?.name] || '#aaa';
  const totalPrice = price * qty;
  const canStack = item.stackable || item.consumable;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Name + rarity */}
      <div>
        <h3 style={{ margin: '0 0 4px 0', color: rarityColor, fontSize: '18px' }}>
          {TYPE_ICONS[item.type]} {item.name}
          {item.magical && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#9C27B0' }}>✨ Magical</span>}
        </h3>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {item.rarity?.name} {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </div>
      </div>

      {/* Description */}
      <p style={{ margin: 0, color: '#bbb', fontSize: '13px', lineHeight: '1.6' }}>
        {item.description}
      </p>

      {/* Stats */}
      <ItemStats item={item} />

      {/* Price breakdown */}
      <div style={{
        padding: '12px',
        backgroundColor: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#888', marginBottom: '6px' }}>
          <span>Unit price</span>
          <span style={{ color: '#c9a84c' }}>{formatGold(price)}</span>
        </div>

        {/* Quantity picker — only for stackable/consumable */}
        {canStack && maxQty > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', color: '#888' }}>Quantity</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => onQtyChange(Math.max(1, qty - 1))}
                disabled={qty <= 1}
                style={qtyBtnStyle(qty > 1)}
              >−</button>
              <span style={{ color: '#eee', minWidth: '24px', textAlign: 'center', fontSize: '15px' }}>{qty}</span>
              <button
                onClick={() => onQtyChange(Math.min(maxQty, qty + 1))}
                disabled={qty >= maxQty}
                style={qtyBtnStyle(qty < maxQty)}
              >+</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', borderTop: '1px solid #2a2a2a', paddingTop: '8px', marginTop: '4px' }}>
          <span style={{ color: '#aaa' }}>{priceLabel}</span>
          <span style={{ color: canAfford ? '#4CAF50' : '#f44336' }}>
            {formatGold(totalPrice)}
          </span>
        </div>

        {!canAfford && (
          <div style={{ fontSize: '11px', color: '#f44336', marginTop: '4px' }}>
            Need {formatGold(totalPrice - gold)} more gold
          </div>
        )}
      </div>

      {/* Action button */}
      <button
        onClick={onAction}
        disabled={!canAfford}
        style={{
          padding: '14px',
          backgroundColor: canAfford ? actionColor : '#333',
          color: canAfford ? (actionColor === '#ffd700' ? '#000' : 'white') : '#666',
          border: 'none', borderRadius: '10px', cursor: canAfford ? 'pointer' : 'not-allowed',
          fontSize: '16px', fontWeight: 'bold',
          transition: 'all 0.2s',
          opacity: canAfford ? 1 : 0.6
        }}
      >
        {actionLabel === 'Buy' ? `🛒 Buy${qty > 1 ? ` ×${qty}` : ''}` : `💰 Sell${qty > 1 ? ` ×${qty}` : ''}`}
      </button>
    </div>
  );
}

function ItemStats({ item }) {
  const stats = [];

  if (item.damage)    stats.push({ label: 'Damage',     value: `${item.damage} ${item.damageType || ''}` });
  if (item.ac)        stats.push({ label: 'AC',         value: item.acBonus ? `${item.ac} + ${item.acBonus === 'DEX_MAX2' ? 'DEX (max 2)' : 'DEX'}` : String(item.ac) });
  if (item.acBonus && !item.ac) stats.push({ label: 'AC Bonus', value: `+${item.acBonus}` });
  if (item.saveBonus) stats.push({ label: 'Save Bonus', value: `+${item.saveBonus}` });
  if (item.power && item.effect === 'heal') stats.push({ label: 'Heals',    value: item.power });
  if (item.properties?.length) stats.push({ label: 'Properties', value: item.properties.join(', ') });
  if (item.weight)    stats.push({ label: 'Weight',     value: `${item.weight} lb` });
  if (item.spellId)   stats.push({ label: 'Spell',      value: item.spellId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) });

  if (stats.length === 0) return null;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px'
    }}>
      {stats.map(({ label, value }) => (
        <div key={label} style={{
          padding: '6px 10px',
          backgroundColor: '#1a1a1a',
          borderRadius: '6px',
          border: '1px solid #2a2a2a'
        }}>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>{label}</div>
          <div style={{ fontSize: '12px', color: '#ddd' }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{
      padding: '40px 20px', textAlign: 'center',
      color: '#444', fontSize: '14px'
    }}>
      {message}
    </div>
  );
}

function qtyBtnStyle(enabled) {
  return {
    width: '28px', height: '28px',
    backgroundColor: enabled ? '#333' : '#222',
    color: enabled ? '#eee' : '#555',
    border: '1px solid #444', borderRadius: '4px',
    cursor: enabled ? 'pointer' : 'not-allowed',
    fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
  };
}