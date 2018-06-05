import { Observable,of, BehaviorSubject} from "rxjs";
import { FrameData } from "./frame.interface";
import { buffer, bufferCount,expand, filter, map,  share, tap, withLatestFrom,timestamp} from 'rxjs/operators';

export const clampTo30FPS = (frame: FrameData) => {
    if(frame.deltaTime > (1/30)) {
       frame.deltaTime = 1/30;
     }
     return frame;
   }

export const calculateStep: (prevFrame: FrameData) => Observable<FrameData> = (prevFrame: FrameData) => {
    return Observable.create((observer) => { 
      
      requestAnimationFrame((frameStartTime) => {      
        // Millis to seconds
        const deltaTime = prevFrame ? (frameStartTime - prevFrame.frameStartTime) / 1000 : 0;

        observer.next(new FrameData(frameStartTime,deltaTime));
      })
    })
    .pipe(
      map(clampTo30FPS)
    )
  };

  export const frames$ = of(undefined)
  .pipe(
    expand((val) => calculateStep(val)),
    filter( frame => frame !== undefined),
    map((frame:FrameData) => frame.deltaTime),
    share()
  );

  const keysDown$ = of(undefined)
  .pipe(filter ((keyMap) => keyMap !== undefined));

  export const keysDownPerFrame$ = keysDown$
  .pipe(
    buffer(frames$),
    map((frames: Array<any>) => {
      return frames.reduce((acc, curr) => {
        return Object.assign(acc, curr);
      }, {});
    })
  );


  