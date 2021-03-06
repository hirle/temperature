import React from 'react';
import styled, { keyframes } from 'styled-components';

interface Stylable {
    className?: string;
} 

const FixedTapeRecorder: React.FunctionComponent<Stylable> = (props: Stylable) => (
    <svg
        className={props.className}
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 225.000000 225.000000"
        preserveAspectRatio="xMidYMid meet"
    >
        <g transform="translate(0.000000,225.000000) scale(0.100000,-0.100000)" stroke="none">
            <path d="M80 1923 c-8 -3 -25 -15 -37 -26 l-23 -20 0 -748 0 -748 23 -27 23
            -27 1030 1 c566 0 1042 1 1057 1 16 1 39 12 52 26 l25 24 0 745 0 745 -24 28
            -24 28 -1044 2 c-573 1 -1050 -1 -1058 -4z m615 -158 c87 -23 141 -53 207
            -114 101 -93 148 -201 148 -341 0 -340 -350 -564 -655 -421 -296 139 -365 522
            -136 751 117 117 284 164 436 125z m1056 5 c82 -15 177 -66 240 -130 228 -227
            165 -604 -123 -744 -314 -153 -668 66 -668 412 0 140 43 244 140 336 115 110
            259 154 411 126z"/>
            <path id="left"
                d="M495 1592 c-27 -10 -49 -22 -48 -28 1 -5 21 -43 44 -83 35 -60 40
                -77 30 -90 -6 -9 -18 -31 -26 -48 l-15 -33 -96 0 -97 0 6 -45 c9 -62 48 -134
                96 -178 23 -20 45 -37 49 -37 5 0 28 35 52 78 l44 79 57 -1 57 -1 43 -77 c24
                -43 48 -78 53 -78 6 0 33 24 61 53 53 54 85 122 85 179 l0 28 -100 0 c-92 0
                -100 2 -100 19 0 11 -11 32 -24 48 l-24 28 44 75 c24 41 44 80 44 87 0 16 -92
                43 -144 43 -23 -1 -63 -9 -91 -18z"/>
            <path id="right"
                d="M1560 1574 c-19 -8 -36 -17 -38 -19 -2 -2 17 -41 41 -87 l46 -83 -25
                -28 c-13 -15 -24 -37 -24 -48 0 -18 -8 -19 -100 -19 l-101 0 7 -37 c10 -61 42
                -125 82 -166 64 -67 65 -67 117 26 l46 82 52 0 52 0 45 -77 c25 -42 48 -80 52
                -83 4 -4 28 13 54 37 54 49 94 126 94 181 l0 37 -94 0 -94 0 -11 32 c-6 17
                -18 40 -27 49 -15 16 -12 24 30 100 36 63 44 84 34 91 -47 30 -181 37 -238 12z"/>
        </g>
    </svg>);


const rotateGear = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

interface TapeRecorderProps extends Stylable {
    running: boolean,
}

const AnimatedTapeRecorder = styled(FixedTapeRecorder) <TapeRecorderProps>`
  #left {
    transform-origin: 580px 1300px;
    animation-duration: 10s;
    animation-name: ${rotateGear};
    animation-fill-mode: forwards;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-play-state: ${props => props.running ? 'running' : 'paused'};
  } 
  #right {
    transform-origin: 1650px 1300px;
    animation-duration: 10s;
    animation-name: ${rotateGear};
    animation-fill-mode: forwards;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-play-state: ${props => props.running ? 'running' : 'paused'};
  } 
`;

export default (props: TapeRecorderProps) => {
    return <AnimatedTapeRecorder running={props.running} className={props.className}/>;
};
