"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { characters, Character } from "@/data/characters";
import { Zen_Dots, Geo } from "next/font/google";

const zenDots = Zen_Dots({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-zen-dots",
});

const geo = Geo({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-geo",
});

gsap.registerPlugin(ScrollTrigger);

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const scrambleText = (element: HTMLElement, finalText: string, duration: number = 1000) => {
  let iteration = 0;
  const chars = finalText.split('');
  
  // Start with scrambled text immediately
  element.textContent = chars
    .map(() => letters[Math.floor(Math.random() * letters.length)])
    .join('');
  
  const interval = setInterval(() => {
    element.textContent = chars
      .map((char, index) => {
        if (index < iteration) {
          return finalText[index];
        }
        return letters[Math.floor(Math.random() * letters.length)];
      })
      .join('');

    iteration += 1/3;

    if (iteration >= finalText.length) {
      clearInterval(interval);
      element.textContent = finalText;
    }
  }, 30);
};

export default function Home() {
  const mainPanelRef = useRef<HTMLDivElement>(null);
  const backgroundDivRef = useRef<HTMLDivElement>(null);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // Fixed scrambled text to prevent hydration errors - start with actual names, replace after mount
  const [scrambledTexts, setScrambledTexts] = useState(() => 
    characters.map(char => char.name) // for SSR
  );
  const [isClient, setIsClient] = useState(false);

  // Initialize scrambled text on client side only
  useEffect(() => {
    setIsClient(true);
    setScrambledTexts(
      characters.map(char => 
        char.name.split('').map(() => letters[Math.floor(Math.random() * letters.length)]).join('')
      )
    );
  }, []);

  useEffect(() => {
    const panel = mainPanelRef.current;
    let currentIndex = 0;
    let isAnimating = false;

    const handleMouseMove = (e: MouseEvent) => {
      // Throttle mouse position updates to reduce re-renders
      requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Initialize scramble effect for the first character
    setTimeout(() => {
      if (isClient) {
        const firstCharacterElement = document.querySelector('[data-text-left-index="0"] [data-scramble-text]') as HTMLElement;
        if (firstCharacterElement) {
          const finalText = firstCharacterElement.getAttribute('data-scramble-text') || firstCharacterElement.textContent || '';
          scrambleText(firstCharacterElement, finalText);
        }
      }
    }, 100);

    if (panel) {
      ScrollTrigger.create({
        trigger: panel,
        pin: true,
        start: "top top",
        end: () => `+=${window.innerHeight * (characters.length - 1) * 2}`,
        onUpdate: (self) => {
          if (isAnimating) return;

          const progress = self.progress;
          const newIndex = Math.min(
            Math.floor(progress * characters.length),
            characters.length - 1
          );

          if (newIndex !== currentIndex) {
            isAnimating = true;
            const scrollingDown = newIndex > currentIndex;

            animateCharacterTransition(currentIndex, newIndex, scrollingDown).then(() => {
              isAnimating = false;
            });

            currentIndex = newIndex;
            setCurrentCharacterIndex(newIndex);
          }
        },
      });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isClient]);

  const animateCharacterTransition = (fromIndex: number, toIndex: number, scrollingDown: boolean) => {
    return new Promise<void>((resolve) => {
      const fromImage = document.querySelector(`[data-character-index="${fromIndex}"]`);
      const toImage = document.querySelector(`[data-character-index="${toIndex}"]`);
      const fromTextLeft = document.querySelector(`[data-text-left-index="${fromIndex}"]`);
      const toTextLeft = document.querySelector(`[data-text-left-index="${toIndex}"]`);
      const fromTextRight = document.querySelector(`[data-text-right-index="${fromIndex}"]`);
      const toTextRight = document.querySelector(`[data-text-right-index="${toIndex}"]`);

      if (!fromImage || !toImage || !fromTextLeft || !toTextLeft || !fromTextRight || !toTextRight) {
        resolve();
        return;
      }

      const masterTl = gsap.timeline({ onComplete: resolve });

      // Get text elements with proper selectors
      const fromLeftTextElements = fromTextLeft.querySelectorAll('.text-element');
      const toLeftTextElements = toTextLeft.querySelectorAll('.text-element');
      const fromRightTextElements = fromTextRight.querySelectorAll('.text-element');
      const toRightTextElements = toTextRight.querySelectorAll('.text-element');

      // 1. Animate out old content
      masterTl.to([...fromLeftTextElements, ...fromRightTextElements], {
        opacity: 0,
        y: -30,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.in",
      });

      masterTl.to(fromImage, {
        x: scrollingDown ? "-100%" : "100%",
        duration: 0.5,
        ease: "power2.inOut",
      }, "<");

      // 2. Animte in new character image
      masterTl.set(toImage, {
        x: scrollingDown ? "100%" : "-100%",
        opacity: 1,
        zIndex: 60
      });

      masterTl.to(toImage, {
        x: "0%",
        duration: 0.5,
        ease: "power2.inOut",
      }, "-=0.2");

      // 3. Animate in new text content
      masterTl.fromTo([...toLeftTextElements, ...toRightTextElements], {
        opacity: 0,
        y: 30,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: "power2.out",
      }, "-=0.2");

      // 3.5. Scramble text effect
      masterTl.call(() => {
        const scrambleElement = toTextLeft.querySelector('[data-scramble-text]') as HTMLElement;
        if (scrambleElement) {
          const finalText = scrambleElement.getAttribute('data-scramble-text') || scrambleElement.textContent || '';
          scrambleText(scrambleElement, finalText);
        }
      }, [], "-=0.1");

      // 4. Reset positions for next transition
      masterTl.set(fromImage, { 
        x: scrollingDown ? "-100%" : "100%", 
        zIndex: 30,
        opacity: 0 
      });
    });
  };

  const currentCharacter = characters[currentCharacterIndex];

  return (
    <main
      ref={mainPanelRef}
      className="h-screen w-full overflow-hidden bg-[#F3F0EC] cursor-none"
    >
      {/* Custom Cursor */}
      <div
        className="fixed pointer-events-none z-50 mix-blend-difference"
        style={{
          left: mousePosition.x - 10,
          top: mousePosition.y - 10,
          width: '20px',
          height: '20px',
          backgroundColor: currentCharacter.themeColor,
          borderRadius: '50%',
          transition: 'all 0.1s ease-out',
        }}
      />
      
      <div className="relative h-full w-full">
        {/* Full screen height background behind character */}
        <div
          className="absolute left-1/2 top-0 transition-colors duration-500 -translate-x-1/2 h-full w-[32vw] z-10 overflow-hidden"
          ref={backgroundDivRef}
          style={{ backgroundColor: currentCharacter.themeColor }}
        >
          {/* Subtle gradient overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `linear-gradient(45deg, transparent 30%, ${currentCharacter.themeColor}40 70%)`
            }}
          />
        </div>

        <div className="absolute left-0 top-0 h-full w-[25%] p-12 z-20 overflow-hidden">
          {characters.map((char, index) => (
            <div
              key={char.name}
              data-text-left-index={index}
              className="absolute inset-0 p-12"
              style={{
                opacity: index === currentCharacterIndex ? 1 : 0,
                pointerEvents: index === currentCharacterIndex ? 'auto' : 'none'
              }}
            >
              <div className="flex h-full flex-col justify-between text-element">
                <div className="flex h-full flex-col justify-center">
                  <div className="flex flex-col gap-4 text-element">
                    {/* <h1 className={`text-5xl font-extrabold uppercase tracking-wider text-black text-element ${zenDots.className}`}>
                      {char.name}
                    </h1> */}
                    <h1 
                      className={`text-[40px] font-extrabold uppercase tracking-wider text-black text-element ${zenDots.className}`}
                      data-scramble-text={char.name}
                      style={{ cursor: "default", userSelect: "none" }}
                      aria-label={char.name}
                    >
                      {scrambledTexts[index]}
                    </h1>
                    <p
                      style={{ color: currentCharacter.themeColor }}
                      className={`mt-2 text-3xl uppercase font-bold text-element ${geo.className}`}>
                      {char.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-element">
                  <div
                    className="relative h-20 w-20 overflow-hidden"
                    style={{ backgroundColor: currentCharacter.themeColor }}
                  >
                    <Image
                      src={char.nextCharacter.image}
                      alt={char.nextCharacter.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">NEXT</p>
                    <p className="text-lg font-bold text-black">
                      {char.nextCharacter.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Center - Character images */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[80vh] w-[50vw] overflow-hidden z-20">
          {characters.map((char, index) => (
            <div
              key={index}
              data-character-index={index}
              className="absolute inset-0 h-full w-full"
              style={{
                transform: index === 0 ? 'translateX(0%)' : 'translateX(100%)',
                zIndex: index === 0 ? 60 : 30,
              }}
            >
              <Image
                src={char.image}
                alt={char.name}
                fill
                style={{ objectFit: "contain" }}
                className="z-50"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        <div className="absolute right-10 top-0 h-full w-[25%] z-20 overflow-hidden">
          {characters.map((char, index) => (
            <div
              key={char.name}
              data-text-right-index={index}
              className="absolute inset-0 p-12"
              style={{
                opacity: index === currentCharacterIndex ? 1 : 0,
                pointerEvents: index === currentCharacterIndex ? 'auto' : 'none'
              }}
            >
              <div className="flex h-full flex-col justify-center gap-8">
                <p className="text-sm leading-relaxed text-gray-700 text-element">
                  {char.description}
                </p>
                <div className="text-element group">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-110"
                      style={{ backgroundColor: currentCharacter.themeColor }}
                    >
                      T
                    </div>
                    <h3 className="text-xs font-bold uppercase text-gray-500">
                      Tactical Ability
                    </h3>
                  </div>
                  <p className={`text-2xl font-bold uppercase tracking-widest text-black transition-colors group-hover:opacity-80 ${zenDots.className}`}>
                    {char.abilities.tactical}
                  </p>
                </div>
                <div className="text-element group">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-110"
                      style={{ backgroundColor: currentCharacter.themeColor }}
                    >
                      P
                    </div>
                    <h3 className="text-xs font-bold uppercase text-gray-500">
                      Passive Ability
                    </h3>
                  </div>
                  <p className={`text-2xl font-bold uppercase tracking-widest text-black transition-colors group-hover:opacity-80 ${zenDots.className}`}>
                    {char.abilities.passive}
                  </p>
                </div>
                <div className="text-element group">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-110"
                      style={{ backgroundColor: currentCharacter.themeColor }}
                    >
                      U
                    </div>
                    <h3 className="text-xs font-bold uppercase text-gray-500">
                      Ultimate Ability
                    </h3>
                  </div>
                  <p className={`text-2xl font-bold uppercase tracking-widest text-black transition-colors group-hover:opacity-80 ${zenDots.className}`}>
                    {char.abilities.ultimate}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Character progress indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {characters.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-8 transition-all duration-300`}
              style={{
                backgroundColor: index === currentCharacterIndex
                  ? currentCharacter.themeColor
                  : '#d1d5db'
              }}
            />
          ))}
        </div>

        <Header currentCharacter={currentCharacter} />
      </div>
    </main>
  );
}

// Header component remains the same
function Header({ currentCharacter }: { currentCharacter: Character }) {
  return (
    <header className="absolute top-0 left-0 flex w-full items-center justify-between p-8 text-sm font-bold uppercase z-30">
      <div className="text-2xl font-extrabold">APEX</div>
      <nav className="flex items-center gap-8 text-gray-500">
        <a href="#" className="hover:text-black transition-colors">
          Legends
        </a>
        <a href="#" className="hover:text-black transition-colors">
          Seasons
        </a>
        <a href="#" className="hover:text-black transition-colors">
          Battle Pass
        </a>
        <a href="#" className="hover:text-black transition-colors">
          News
        </a>
      </nav>
      <div></div>
    </header>
  );
}