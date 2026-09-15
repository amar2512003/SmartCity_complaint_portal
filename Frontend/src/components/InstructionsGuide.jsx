import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// A small "how it works" guide, purely informational — it doesn't touch any
// of the existing auth / grievance / resolve mechanisms. Mirrors the
// AiAssistant fab+panel pattern but sits on the opposite (left) side of the
// viewport so the two floating buttons never collide. Copy is pulled from
// the `citizen` i18n namespace (`instructions.*`), so it automatically
// follows the existing EN/BN language toggle — no separate language switch
// needed inside the panel itself.
export default function InstructionsGuide() {
  const { t } = useTranslation('citizen');
  const [open, setOpen] = useState(false);

  const steps = t('instructions.steps', { returnObjects: true }) || [];

  return (
    <div className="instructions-guide">
      {open && (
        <div className="instructions-panel panel" role="dialog" aria-modal="true">
          <div className="instructions-panel-head">
            <div className="instructions-panel-title">
              <span className="instructions-avatar" aria-hidden="true">?</span>
              <div>
                <strong>{t('instructions.title')}</strong>
                <span>{t('instructions.subtitle')}</span>
              </div>
            </div>

            <button
              type="button"
              className="ai-close"
              onClick={() => setOpen(false)}
              aria-label={t('instructions.closeAria')}
            >
              ✕
            </button>
          </div>

          <div className="instructions-body">
            <ol className="instructions-steps">
              {Array.isArray(steps) &&
                steps.map((step, i) => (
                  <li key={i} className="instructions-step">
                    <div className="instructions-step-heading">{step.heading}</div>
                    <p className="instructions-step-body">{step.body}</p>
                  </li>
                ))}
            </ol>

            <p className="instructions-footer">{t('instructions.footer')}</p>
          </div>
        </div>
      )}

      <button
        type="button"
        className="instructions-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? t('instructions.closeFabAria') : t('instructions.openFabAria')}
      >
        {open ? '✕' : '?'}
      </button>
    </div>
  );
}
