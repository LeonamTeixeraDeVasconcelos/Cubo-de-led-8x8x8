
const animations = {
    
    cleanFrame: function() {
        let frame = Array(64);

        for(let i = 0; i < 64; i++) {
            frame[i] = Array(8);

            for(let j = 0; j < 8; j++) {
                frame[i][j] = 0;
            }
        } 
        
        return frame;
    },
    
    functions : {
        'animation-1': function() {
            let frames = [];
    
            for(let i = 0; i < 8; i++) {
                let frame = animations.cleanFrame();
                frames.push(frame);
                frame = copyFrameArray(frame);
        
                for(let j = 0; j < 8; j++) {
                    let column = i * 8 + j;
                    
                    for(let k = 0; k < 8; k++) {
                        frame[column][k] = 1;
                        
                        frames.push(frame);
                        frame = copyFrameArray(frame);
                    }  
                }
            }
        
        
           return frames;
        },

        'animation-2': function() {
            let frames = [];

            const changeFrameFunctions = [
                (frame, i, j, k, value) => {
                    frame[ i * 8 + j ][k] = value;
                },

                (frame, i, j, k, value) => {
                    frame[ k * 8 + j ][i] = value;
                },

               (frame, i, j, k, value) => {
                    frame[ k * 8 + i ][j] = value;
                }
            ]
            

            for(let step = 0; step < 3; step++) {
                for(let repeat = 0; repeat < 2; repeat ++ ) {
                    
                    for(let i = 0; i < 8; i++) {
                        let frame = animations.cleanFrame();
                        
                        for(let j = 0; j < 8; j++) {
                            for(let k = 0; k < 8; k++) {

                                changeFrameFunctions[ step ](frame, i, j, k, 1);
                            }                    
                        }
        
                        frames.push(frame);
                    }
    
                }
            }
            

            
        
        
           return frames;
        }
    }
    
}


module.exports = animations;





function copyFrameArray(initial) {
    let frame = Array(64);


    for(let i = 0; i < 64; i++) {
        frame[i] = Array(8);
        
        for(let j = 0; j < 8; j++) {
            frame[i][j] = initial[i][j];
        }
    }

    return frame;

}