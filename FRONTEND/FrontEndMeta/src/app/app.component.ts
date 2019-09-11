import { Component, OnInit }  from '@angular/core';
import { HostListener }       from '@angular/core'; 
import { HttpHeaders }        from '@angular/common/http';
import { environment }        from '../environments/environment';
import { HttpModule }         from '@angular/http';
import { HttpClient }         from '@angular/common/http';
import { Observable }         from 'rxjs';
import { Led }                from './Led';
import * as p5                from 'p5';


export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  }

  public nome: string;
  public descricao: string;

  /**
    Variável de controle do carregamento do
    botão de envio para o servidor.

    Ao enviar é setada para true, ao ter a 
    promise resolvida, é setada como false.
   */
  public loading: boolean = false;
  
  /**
    Variável para controle do modal que po-
    de ou não fazer parte do trabalho final.
   */
  public menu: boolean = false;

  /**
    Objeto da biblioteca p5.
   */
  private p5;

  /**
    Armazena o número do frame atual que es-
    tá sendo renderizado na tela.

    Um frame é um conjunto ordenado de 8 fa-
    ces, e uma face é um conjunto ordenado 
    de 64 leds. Tratando como variáveis boo-
    leanas, podemos convencionar:

      - Uma face são 64 bits:
        
        face fc1 = [
          b, b, b, b, b, b, b, b,
          b, b, b, b, b, b, b, b,
          b, b, b, b, b, b, b, b,
          b, b, b, b, b, b, b, b,
          b, b, b, b, b, b, b, b,
          b, b, b, b, b, b, b, b,
          b, b, b, b, b, b, b, b,
          b, b, b, b, b, b, b, b
        ]

        onde b_i = 1 significa que o Led i es-
        tá aceso, e b_i = 0 significa que o 
        led i está apagado.
      
      - Um frame são 8 faces, ou 512 bits:

        frame fm1 = [
          fc0 = [ b_0, b_1, b_2, ..., b_63 ],
          fc1 = [ b_0, b_1, b_2, ..., b_63 ],
          fc2 = [ b_0, b_1, b_2, ..., b_63 ],
          fc3 = [ b_0, b_1, b_2, ..., b_63 ],
          fc4 = [ b_0, b_1, b_2, ..., b_63 ],
          fc5 = [ b_0, b_1, b_2, ..., b_63 ],
          fc6 = [ b_0, b_1, b_2, ..., b_63 ],
          fc7 = [ b_0, b_1, b_2, ..., b_63 ]
        ]
   */
  private frame: number;

  /**
    Valor do frame anterior para controle da
    timeline de animação.

    Uma animação é um conjunto de frames.

    Para essa implementação o número máximo
    de frames por animação é 100. 
   */
  private prevframe: number;
  private cacheframe: number;

  /**
    Número do quadrante que o evento de cli-
    que do mouse foi detectado.

    Temos 8 quadrantes:

    _________________________
    |     |     |     |     |
    | q0  | q1  | q2  | q3  |
    -------------------------
    |     |     |     |     |
    | q4  | q5  | q6  | q7  |
    -------------------------

   */
  static quadrante: number;

  /**
    Lista com os 512 leds presentes no frame
    atual. 
    
    A cada novo frame esse arry é limpo.
   */
  static ledList = new Array(512);

  /** 
    Lista de frames da animação.

    São 100 frames no máximo.
   */
  static frameList = new Array(100);

  ngOnInit () {
    this.createCanvas();
  }

  constructor (
    private http: HttpClient
  ) {  

    this.frame = 1;
    this.prevframe = this.frame;
    this.cacheframe = 1;

    // Inicializa o vetor de frames com um array de
    // 512 bits por posição.
    for(let i = 0; i < AppComponent.frameList.length; i++ ) {
      AppComponent.frameList[i] = new Array<boolean>(512);
    }

  }

  /**
    Função para detectar eventos do teclado para
    orperar a timeline.
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 

    if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
      this.frame = (this.frame < 100) ? this.frame + 1 : this.frame;
    }

    if (event.keyCode === KEY_CODE.LEFT_ARROW) {
      this.frame = (this.frame > 1) ? this.frame - 1 : this.frame;
    }

    this.setFrame(event);
  }

  private createCanvas() {
    this.p5 = new p5(this.sketch);
    AppComponent.quadrante = 0;
  }

  getQuadrante() {
    return AppComponent.quadrante;
  }

  setLeds ( ) {
    AppComponent.ledList.forEach((led) => {
      led.on = true;
    });
  }

  cleanLeds () {
    AppComponent.ledList.forEach((led) => {
      led.on = false;
    });
  }

  setFrame ( event: any ) {

    this.cacheframe = this.prevframe;

    for ( let i = 0; i < AppComponent.ledList.length; i ++ ) {
      AppComponent.frameList[this.prevframe - 1][i] = AppComponent.ledList[i].on; 
    }

    this.prevframe = this.frame;

    for ( let i = 0; i < AppComponent.ledList.length; i ++ ) {
      AppComponent.ledList[i].on = AppComponent.frameList[this.frame - 1][i];
    }

  }

  resetar () {
    for(let i = 0; i < AppComponent.frameList.length; i++ ) {
      AppComponent.frameList[i] = new Array<boolean>(512);
    }

    this.cleanLeds();

    this.frame = 0;
  }

  copyPrevLeds() {
    let cont = 0;
    
    AppComponent.frameList[this.cacheframe - 1].forEach((led) => {
      AppComponent.ledList[cont].on = led;
      cont ++;
    });
  }

  copyFirstFace() {
    let face: boolean[];

    face = AppComponent.ledList.slice(0, 64).map((led)=>{
      return led.on;
    }); 

    for( let i = 0; i < 512; i+=64 ) {
      for( let j = 0; j < 64; j ++ ) {
        AppComponent.ledList[i + j].on = face[j];
      }
    }

    // console.log(face);

  }

  invLeds() {
    AppComponent.ledList.forEach((led)=>{
      led.on = !led.on;
    })
  }

  enviar () {

    this.loading = true;

    let postBody = {
      nome  : this.nome,
      descricao : this.descricao,
      frames : []
    };

    let body_frame = [];    

    if ( AppComponent.frameList.length == 0 ) {
      AppComponent.ledList.forEach((led)=>{
        body_frame.push( (led.on) ? true : false );
      });
      postBody.frames.push( body_frame );
    }


    // Filtra os frames do array de frames para e-
    // vitar overfetching na api. 


    // TODO: Se dois frames com conteúdo tiverem
    // um frame nulo entre os mesmos, o frame nu-
    // lo não é transmitido no request
    AppComponent.frameList.forEach(( frame ) => {
      let send: boolean = false;

      // Verifica se frame é nulo ou não
      frame.forEach(( led ) => {
        send  = send || led;
      });

      
      if ( send ) {
        frame = frame.map(( led ) => {
          if(!led)
            return false;
          else 
            return true;
        });

        body_frame = [];

        let full_size = 511;

        while(full_size >= 63) {
          let y_iterator = full_size;
          for ( let x_iterator = 0; x_iterator < 8; x_iterator ++ ) {
            for ( let z_iterator = 0; z_iterator < 8; z_iterator ++ ) {
              body_frame.push(frame[y_iterator - z_iterator * 8]);
            }
            y_iterator -= 1;
          }
          full_size -= 64;
        }
        postBody.frames.push(body_frame);
      }
    });

    if ( AppComponent.frameList.length != 0 ) {
      AppComponent.ledList.forEach((led)=>{
        body_frame.push( (led.on) ? true : false );
      });
      postBody.frames.push( body_frame );
    }

    this.http.post( 
          `${environment.api_url}animation/`,
          postBody, 
          this.httpOptions )
        .subscribe ((dados) => {
          this.loading = false;
        });

    


  }

  enviarLetra() {
    let frame = [];

    AppComponent.ledList.forEach(led=>{
      frame.push(led.on);
    });

    let body_frame = {
      letter: this.nome,
      frame: []
    };

    let full_size = 511;

    while(full_size >= 63) {
      let y_iterator = full_size;
      for ( let x_iterator = 0; x_iterator < 8; x_iterator ++ ) {
        for ( let z_iterator = 0; z_iterator < 8; z_iterator ++ ) {
          body_frame.frame.push(frame[y_iterator - z_iterator * 8]);
        }
        y_iterator -= 1;
      }
      full_size -= 64;
    }

    console.log(body_frame);

    this.http.post( 
          `${environment.api_url}create-letter/`,
          body_frame, 
          this.httpOptions )
        .subscribe ((dados) => {
          this.loading = false;
        });
    
  }

  static setQuadrante( x: number ) {
    AppComponent.quadrante = x;
  }

  sketch(p: any) {

    let width: number  = Math.floor(p.windowWidth - 0.3 * p.windowWidth);
    let height: number = width / 4 * 2;
    let max: number    = 8;
    let dimQ: number   = ( width / 56 );
    let radius: number = dimQ/2;
    let lastLed: Led   = new Led(0, 0);
    let colorArray     = [
      p.color('rgb(0,0,255)'),
      p.color('rgb(255,0,0)'),
      p.color('rgb(0,255,0)'),
      p.color('rgb(0,255,255)'),
      p.color('rgb(255,0,255)'),
      p.color('rgb(255,255,0)'),
      p.color('rgb(255,100,0)'),
      p.color('rgb(0,100,255)'),
      p.color('rgb(255,255,255)'),
      p.color('#3caea3'),
      p.color('#20639b'),
      p.color('#f6d55c'),
      p.color('#282A36')
    ];

    p.generateLeds = ( newLeds: boolean = true ) => {
      let x = 0, y = 0;
    
      let cont = 0;
      
      for (let f = 0; f < max; f++) {
        
        for ( let i = 1; i <= max; i++ ) {
          
          for ( let j = 1; j <= max; j++ ) {

            // Calcula o x do próximo led
            x =  ( f % ( max / 2 ))  * ( width / 4 ) + j * ( width / 40 ) ;
            y =  (( f < ( max / 2 )) ? 0 : 1 ) * ( height / 2 ) + ( i ) * ( height / 20 );
            
            // Cont tbm pode ser gerado em função das variáveis:
            // j + (i - 1) * (max) + (f - 1) * max * max - 1
            if ( newLeds ) {
              AppComponent.ledList[ cont ] = new Led( x, y );
            } else {
              AppComponent.ledList[ cont ].x = x;
              AppComponent.ledList[ cont ].y = y;
            }

            p.rect( AppComponent.ledList[ cont ].x, AppComponent.ledList[ cont ].y, dimQ, dimQ, radius );

            cont ++;

          }
        }
      }
    }

    p.windowResized = () => {
      width   = Math.floor(p.windowWidth - 0.3 * p.windowWidth);
      dimQ    = ( width / 56 );
      height  = width / 4 * 2;
      p.resizeCanvas(width, height);
      p.background(colorArray[12]);
      p.generateLeds( false );
    }

    p.setup = () => {
      let canvas = p.createCanvas(width, height);
      
      canvas.parent('canvas-div');
      
      canvas.class("p5Canvas");
      
      p.background(colorArray[12]);
      
      p.stroke(colorArray[8])
      
      // Descomentar para ver as linhas de divisão dos leds
      // for(let i = 0; i < 20; i++) {
      //   p.line(0, ( i + 1 ) * height/20, width, ( i + 1 ) * height/20)
      // }
      // for(let i = 0; i < 40; i++) {
      //   p.line((i + 1) * width/40, 0, (i + 1) * width/40, height)
      // }

      p.frameRate(15);

      p.generateLeds();

      p.stroke(colorArray[0])
      
    }

    p.draw = () => {
      for (let i = 0; i < AppComponent.ledList.length; i++) {
        let a: Led = AppComponent.ledList[ i ];
        ( a.on ) ? p.fill  (colorArray[7]) : p.fill(colorArray[8]);
        ( a.on ) ? p.stroke(colorArray[7]) : p.stroke(colorArray[8]);
        p.rect( a.x, a.y, dimQ, dimQ, radius );
      }
    }

    p.mouseClicked = () => {
      p.invertLedAt(p.mouseX, p.mouseY, false);
    }  

    p.mouseDragged = () => {
      p.invertLedAt(p.mouseX, p.mouseY, true);
    }

    p.invertLedAt = ( x: number, y: number, dragged: boolean ) => {
      let a: Led = p.getLedAt(x, y, dragged);
      if (a)
        a.on = !a.on;
    }

    p.verificaRanges = (x: number, y: number): boolean => {
      return false;
    }

    p.getLedAt = ( x: number, y: number, dragged: boolean ) => {

      if ( x >= width || x < 0 || y >= height || y < 0 ) {
        return null;
      }
      
      let xq: number = Math.floor( x / ( width / 4 ));
      let yq: number = Math.floor( y / ( height / 2 ));

      AppComponent.setQuadrante(xq + yq * max / 2);

      // Armazena largura e altura de cada led:
      // No caso atual a largura é igual a algura
      // mas deixei assim para deixar dinâmico;
      let largura: number = width / 40;
      let altura: number = height / 20; 

      // Itera e verifica se as coordenadas do mouse 
      // passadas por parâmetro estão dentro do range
      // da área reservada para os leds no grid:
      //    
      //    O primeiro loop verifica se estão dentro da 
      //    região demarcada abaixo horizontamentte, en
      //    quanto que o segundo for verifica se estão
      //    dentro da região demarcada verticalmente:
      //                  ↓                             ↓
      //         |--------------------|        |--------------------|
      //    _ .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
      //   |  .  *  *  *  *  *  *  *  *  .  .  *  *  *  *  *  *  *  *  .  .
      //   |  .  *  *  *  *  *  *  *  *  .  .  *  *  *  *  *  *  *  *  .  .
      //   |  .  *  *  *  *  *  *  *  *  .  .  *  *  *  *  *  *  *  *  .  .
      // → |  .  *  *  *  *  *  *  *  *  .  .  *  *  *  *  *  *  *  *  .  . ...
      //   |  .  *  *  *  *  *  *  *  *  .  .  *  *  *  *  *  *  *  *  .  .
      //   |  .  *  *  *  *  *  *  *  *  .  .  *  *  *  *  *  *  *  *  .  .
      //   |  .  *  *  *  *  *  *  *  *  .  .  *  *  *  *  *  *  *  *  .  .
      //   |_ .  *  *  *  *  *  *  *  *  .  .  *  *  *  *  *  *  *  *  .  .
      //      .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .

      for ( let i = 0; i < ( max / 2 ); i++ ) {
        if ( x >= ((( i ) * ( max + 2 )) * ( largura ))
          && x <= ((( i ) * ( max + 2 )) * ( largura ) + largura) 
          || x >= ((( i ) * ( max + 2 ) + 9) * ( largura ))
          && x <= ((( i ) * ( max + 2 ) + 9) * ( largura ) + largura)) {
            return null;
        }
      }

      for ( let i = 0; i <= ( max / 4 ); i++ ) {
        if ( y >= ((( i ) * ( max + 2 )) * ( altura ))
          && y <= ((( i ) * ( max + 2 )) * ( altura ) + altura ) 
          || y >= ((( i ) * ( max + 2 ) + 9) * ( altura ))
          && y <= ((( i ) * ( max + 2 ) + 9) * ( altura ) + altura )) {
            return null;
        }
      }

      // Acha a posição do led clicado no array de leds baseando-se 
      // no x e y clicados com o mouse;
      let index = (  Math.floor( xq + yq * max    / 2 ) * max * max ) 
                + (  Math.floor(( x - xq * width  / 4 ) / ( largura )))
                + (( Math.floor(( y - yq * height / 2 ) / ( altura )) - 1 ) * max ) 
                - 1;

      if ( index < 0 || index > max * max * max ) {
         return null;
      } else {

        if (lastLed.equals(AppComponent.ledList[ index ])) {
          return null;
        } 

        lastLed = AppComponent.ledList[ index ];

        return lastLed;
      }
    }
  }
}
