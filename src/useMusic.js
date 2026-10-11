import { useCallback, useEffect, useRef, useState } from 'react';
import { createSynth } from './synth.js';

// Plays song.mp3 when it exists, otherwise falls back to the built-in melody.
export function useMusic(file) {
  const audioRef = useRef(null);
  const synthRef = useRef(null);
  const activeRef = useRef(null); // 'file' | 'synth'
  const fileOkRef = useRef(null); // null = still checking
  const volRef = useRef(0.8);
  const playingRef = useRef(false);

  const [fileOk, setFileOk] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ cur: 0, dur: 0 });
  const [volume, setVolumeState] = useState(0.8);

  useEffect(() => {
    const a = new Audio();
    a.loop = true;
    a.preload = 'auto';
    let dead = false;
    a.addEventListener('loadedmetadata', () => {
      if (dead) return;
      fileOkRef.current = true;
      setFileOk(true);
      setTime({ cur: 0, dur: a.duration || 0 });
    });
    a.addEventListener('error', () => {
      if (dead) return;
      fileOkRef.current = false;
      setFileOk(false);
    });
    a.addEventListener('timeupdate', () => {
      if (!dead) setTime({ cur: a.currentTime, dur: a.duration || 0 });
    });
    a.src = file;
    audioRef.current = a;
    return () => {
      dead = true;
      a.pause();
      a.removeAttribute('src');
      a.load();
      if (synthRef.current) synthRef.current.destroy();
      synthRef.current = null;
    };
  }, [file]);

  const startSynth = useCallback(() => {
    try {
      if (!synthRef.current) synthRef.current = createSynth();
      synthRef.current.setVolume(volRef.current);
      synthRef.current.play();
      activeRef.current = 'synth';
      playingRef.current = true;
      setPlaying(true);
    } catch (e) {
      // Audio not available in this browser
    }
  }, []);

  const play = useCallback(() => {
    const a = audioRef.current;
    if (fileOkRef.current === true && a) {
      a.volume = volRef.current;
      a.play()
        .then(() => {
          activeRef.current = 'file';
          playingRef.current = true;
          setPlaying(true);
        })
        .catch(() => startSynth());
    } else {
      startSynth();
    }
  }, [startSynth]);

  const pause = useCallback(() => {
    if (activeRef.current === 'file' && audioRef.current) audioRef.current.pause();
    if (activeRef.current === 'synth' && synthRef.current) synthRef.current.pause();
    playingRef.current = false;
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (playingRef.current) pause();
    else play();
  }, [play, pause]);

  const seek = useCallback((t) => {
    if (audioRef.current && activeRef.current === 'file') audioRef.current.currentTime = t;
  }, []);

  const setVolume = useCallback((v) => {
    volRef.current = v;
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (synthRef.current) synthRef.current.setVolume(v);
  }, []);

  // Fills `out` with values 0..1 for the visualizer.
  const getLevels = useCallback((out) => {
    if (!playingRef.current) {
      out.fill(0);
      return;
    }
    if (activeRef.current === 'synth' && synthRef.current && synthRef.current.getLevels(out)) return;
    const t = performance.now() / 1000;
    for (let i = 0; i < out.length; i += 1) {
      out[i] = 0.18 + 0.55 * Math.abs(Math.sin(t * 2.1 + i * 0.55) * Math.sin(t * 1.3 + i * 0.21));
    }
  }, []);

  return {
    mode: fileOk === true ? 'file' : 'synth',
    playing,
    time,
    volume,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    getLevels,
  };
}
