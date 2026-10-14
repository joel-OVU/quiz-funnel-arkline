import React from 'react';
import { deckingQuizConfig } from '../config/deckingQuoteConfig';

interface HeaderProps {
  onOpenConfig?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenConfig }) => {
  return (
    <header className="w-full bg-[#FFFFFF]/80 backdrop-blur-sm border-b border-[#362617]/10 py-3 sticky top-0 z-30 transition-all">
      <div className="max-w-[600px] mx-auto px-4 flex items-center justify-between gap-3">
        {/* Small ARKLINE logo at the top */}
        <div className="flex items-center gap-2.5">
          <img
            src={deckingQuizConfig.brand.logoUrl}
            alt={deckingQuizConfig.brand.name}
            className="h-8 sm:h-9 w-auto object-contain"
            width="100"
            height="36"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== deckingQuizConfig.brand.logoDarkUrl) {
                target.src = deckingQuizConfig.brand.logoDarkUrl;
              }
            }}
          />
          <div className="hidden xs:block border-l border-[#362617]/15 pl-2.5">
            <span className="block text-[11px] font-bold tracking-tight text-[#362617] uppercase">
              ARKLINE
            </span>
            <span className="block text-[9px] text-[#362617]/60 tracking-tight">
              Developments
            </span>
          </div>
        </div>

        {/* Quiet technical setup link for client engineers */}
        {onOpenConfig && (
          <button
            type="button"
            onClick={onOpenConfig}
            className="text-[11px] font-mono text-[#362617]/60 hover:text-[#362617] transition-colors px-2.5 py-1 rounded-full border border-[#362617]/15 hover:bg-[#F6F0EA] cursor-pointer"
            title="Technical & Deployment Reference"
          >
            Integration Guide
          </button>
        )}
      </div>
    </header>
  );
};
