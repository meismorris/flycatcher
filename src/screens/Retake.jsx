import Icon from '../lib/Icon.jsx';

const COPY = {
  glare: ['Glare on the board', 'Step to the side and retake.'],
  blurry: ['The photo is blurry', 'Hold still and tap to focus.'],
  too_dark: ['Too dark to read', 'Find more light and retake.'],
  too_far: ['Too far away', 'Step closer so the flyers fill the frame.'],
  angled: ['Taken at an angle', 'Face the board straight on.'],
  too_many_cut_off: ['Some flyers are cut off', 'Fit the whole board in the frame.']
};

export default function Retake({ photo, check, onRetake, onUseAnyway, canUse }) {
  const issue = (check && check.board_issues && check.board_issues[0]) || 'blurry';
  const [title, tip] = COPY[issue] || COPY.blurry;
  const extra = check && check.retake_flyers && check.retake_flyers.length;
  const corner = (pos, bw, br, i) => <span key={i} style={{ position: 'absolute', ...pos, width: 58, height: 58, borderStyle: 'solid', borderColor: '#fff', borderWidth: bw, borderRadius: br }} />;
  return (
    <div className="screen" style={{ background: '#111' }}>
      <img src={photo} alt="Your photo" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', viewTransitionName: 'board' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.18)' }} />
      <div style={{ position: 'absolute', inset: '0 0 auto', height: 190, background: 'linear-gradient(rgba(0,0,0,.55), transparent)' }} />
      <div style={{ position: 'absolute', inset: 'auto 0 0', height: 340, background: 'linear-gradient(transparent, rgba(0,0,0,.7))' }} />
      <header className="safe-top" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', height: 58, color: '#fff' }}>
        <button className="press" aria-label="Back to camera" onClick={onRetake}><Icon name="arrow-left-circle-fill" size={36} color="#fff" /></button>
        <span className="b" style={{ flex: 1, textAlign: 'center', fontSize: 19 }}>Let's try that again</span>
        <span style={{ width: 36 }} />
      </header>
      <div style={{ position: 'absolute', left: 20, right: 20, top: '17%', bottom: '38%' }}>
        {corner({ left: 0, top: 0 }, '4px 0 0 4px', '20px 0 0 0', 0)}{corner({ right: 0, top: 0 }, '4px 4px 0 0', '0 20px 0 0', 1)}
        {corner({ left: 0, bottom: 0 }, '0 0 4px 4px', '0 0 0 20px', 2)}{corner({ right: 0, bottom: 0 }, '0 4px 4px 0', '0 0 20px 0', 3)}
      </div>
      <div className="safe-bottom" style={{ position: 'absolute', left: 18, right: 18, bottom: 16 }}>
        <div className="rise" style={{ padding: '14px 18px 14px 14px', borderRadius: 22, background: 'rgba(28,28,28,.62)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: 18, color: '#fff' }}>
          <span style={{ width: 52, height: 52, flex: 'none', display: 'grid', placeItems: 'center', borderRadius: 14, boxShadow: 'inset 0 0 0 2.5px #fff' }}><Icon name={issue === 'glare' ? 'sun' : issue === 'blurry' ? 'clock' : 'image'} size={26} color="#fff" /></span>
          <span><span className="b" style={{ display: 'block', fontSize: 17 }}>{title}</span><span style={{ display: 'block', fontSize: 14, opacity: .75, marginTop: 3 }}>{tip}{extra ? ` ${extra} ${extra === 1 ? 'flyer needs' : 'flyers need'} a closer look.` : ''}</span></span>
        </div>
        <button className="pill blue rise" style={{ width: '100%', marginTop: 14, animationDelay: '80ms' }} onClick={onRetake}><Icon name="refresh" size={20} color="#fff" />Retake</button>
        {canUse && <button className="pill ghost rise" style={{ width: '100%', color: 'rgba(255,255,255,.85)', animationDelay: '140ms' }} onClick={onUseAnyway}>Use this photo anyway</button>}
      </div>
    </div>
  );
}
