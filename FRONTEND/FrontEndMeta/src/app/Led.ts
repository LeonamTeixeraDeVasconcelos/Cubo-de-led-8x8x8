/**
 * Arquivo   : Led.ts
 * Classe    : Led
 * Autor     : Leonam Teixeira de Vasconcelos   
 * Data      : 22/08/2019
 * Descrição : Modela um led abstrato, que 
 *      contém as coordenadas posicionais 
 *      do mesmo na matriz e seu estado.
 */

export class Led {
  x: number;
  y: number;
  on: boolean;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.on = false;
  }

  public equals(led: Led): boolean {
    return led.x == this.x && led.y == this.y
  }
}

export default Led;