## Planejamento da execução:
___
1. Desenha frames do cubo no PC;
2. Envia pro Arduino constantemente a sequência;
3. O arquíno terá um buffer para armazenar alguns frames*;
4. O arduíno fará a transmissão para os shift-registers;
5. Cubo brilhará como bosta de unicórnio.

______


### Buffer:

* No início da execução, o Arduíno terá o buffer vazio, obviamente;
* Ao lermos o primeiro buffer, teremos a seguinte arquitetura:

    **| head | -> | matriz_1 | -> | tail |**

* Ao lermos o primeiro buffer, teremos a seguinte arquitetura:

    **| head | -> | matriz_1 | -> | matriz_2 | -> | tail |**
    
* Ao lermos o primeiro buffer, teremos a seguinte arquitetura:

    **| head | -> | matriz_1 | -> | matriz_2 | -> | matriz_3 | -> | tail |**
    
* Ao lermos o primeiro buffer, teremos a seguinte arquitetura:

    **| head | -> | matriz_1 | -> | matriz_2 | -> | matriz_3 | -> | matriz_4 | -> | tail |**

* E assim por diante até atingirmos o tamanho **n** do buffer:
* Ao lermos a matriz **n+1**, o seguinte processo acontecerá:

    **| head | -> | matriz_1 | -> | matriz_2 | -> ... -> | matriz_n | -> | tail |**
    
    **| head | -> | matriz_2 | -> ... -> | matriz_n | -> | matriz_n+1 | -> | tail |**


    
