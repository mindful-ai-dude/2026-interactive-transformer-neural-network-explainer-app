import { gsap } from 'gsap';
import { Flip } from 'gsap/dist/Flip';

gsap.registerPlugin(Flip);

export * from 'gsap';
export { Flip, gsap };

// Type for timeline
export type TimelineType = gsap.core.Timeline;
