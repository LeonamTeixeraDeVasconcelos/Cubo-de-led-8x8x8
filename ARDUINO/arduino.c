
// Includes para C
#include <stdlib.h>
#include <stdio.h>
#include <time.h>


/**
 * Defines
 */

// Dimensão linear
#define MATX_SIZE  8

// Número de bytes por frame
#define DATA_SIZE  64

// Tamanho do buffer
#define BUFF_SIZE  5

// Taxa de frames por segundo. Deve ser padronizada com o servidor, para que não envie frames em uma taxa muito acima da taxa de exibição
#define FRAME_RATE  30

// Taxa de multiplexação (Quantos ciclos de clock devem ser gastos para uma multiplexação completa)
// Por multiplexação completa entende-se uma passada completa em todos os estágios (camadas)
#define MULTIPLEXING_RATE  CLOCKS_PER_SEC


// boolean
/**
 * Padrão:  [y][x][z]
 * 
 */
int matrix[MATX_SIZE][MATX_SIZE][MATX_SIZE], controle;  

char data_array[DATA_SIZE];
char read_data;
int  x, y, z, l, cont;



/**
 *  Variáveis de controle
 */

// Indice do byte a ser recebido
int indice_byte_receber;

// Frame sendo exibido no momento e frame a ser requisitado
int indice_frame_exibicao;
int indice_frame_requisitar;

int camada_ativa;
 




/**
 *  Simulação  // Utilização temporária
 */

// Tempo em que o byte serial chegará
int tempo_chegada_byte_serial;
int byte_pendente;
int frames_para_receber;
int frames_recebidos;

int clocks_delay_bytes;


/**
 *  Protótipos
 */
void setup();
void loop();
void dado_serial_recebido(char byte);
void desativa_camadas();
void envia_requisicao_proximo_frame();

int main() {
    printf("\n[main] Simulação de recebimento de dados e intercalação no arduino");

    setup();

    printf("\n[main] Iniciando loop\n");



    while(1) {
        loop();
    }


    printf("\n");
}


void setup() {
    printf("\n[setup] Início do setup");

    x = 0; // Coordenada x
    y = 0; // Coordenada y
    z = 0; // Coordenada z
    l = 0; // Contador auxiliar



    //Serial.begin(9600); // Abre Serial
    //Serial.println("aberto"); // Escreve mensagem de verificação
    printf("\n[setup] Porta serial aberta");
    



    /* -----------------------------------------
    * Preenche matriz com 1's e 0's alternados
    */
    for ( x = 0; x < MATX_SIZE; ++x ) {   
        for ( y = 0; y < MATX_SIZE; ++y ) {
            for ( z = 0; z < MATX_SIZE; ++z ) {
                matrix[x][y][z] = controle;
                controle = !controle;
            }
        }
    }


    tempo_chegada_byte_serial = 0;
    byte_pendente = 0;
    frames_para_receber = 4;
    
    indice_byte_receber = 0;

    indice_frame_exibicao = -1;
    indice_frame_requisitar = 0;

    // 1/8 de 1 segundo
    clocks_delay_bytes = (CLOCKS_PER_SEC / 8) ;

    camada_ativa = 0;

    envia_requisicao_proximo_frame();
}

void loop() {

    /* ---------------------------------------
    * Espera alguma coisa ser transmitida
    */
    // cont = Serial.peek();
    // if (cont != -1)
    //     Serial.println("dado recebido...");
    // 

    int cur_time = clock();
    if(byte_pendente == 1 && cur_time  >= tempo_chegada_byte_serial) {
        // Dado recebido

        char byte = 'A';
        dado_serial_recebido(byte);

    }


    desativa_camadas();

    // Próximo passo da multiplexação

}


void dado_serial_recebido(char byte) {
    printf("[serial port] Recebimento de dado serial [byte %d] \n", indice_byte_receber);

    // Tempo para proxima chegada do byte
    tempo_chegada_byte_serial = clock() + clocks_delay_bytes ;

    data_array[indice_byte_receber] = byte;
    indice_byte_receber++;

    if(indice_byte_receber == DATA_SIZE) {
        
        byte_pendente = 0;
        frames_recebidos++;

        indice_byte_receber = 0;

        printf("\n64 bytes recebidos\n\n");


        for ( y = 0; y < MATX_SIZE; ++y ) {
            l = 0; // Inicia contador do vetor de dados

            for ( x = 0; x < MATX_SIZE; ++x ) {
                for ( z = 0; z < MATX_SIZE; ++z ) {
                    /*
                    *  Pega bit por bit do dado lido;
                    */

                    matrix[y][x][MATX_SIZE - z - 1] = (( data_array[l] >> z ) & 0x01 );
                }
                l++;
            }
        } 


        // Solicita envio do próximo frame
        if(frames_recebidos < frames_para_receber)
            envia_requisicao_proximo_frame();
    }

        
}

void desativa_camadas() {

}

void envia_requisicao_proximo_frame() {
    // envia_serial
    printf("\n\n\n[Requisição de frame] Frame em exibição: %d;  Frame requisitado: %d\n\n", indice_frame_exibicao, indice_frame_requisitar);
    indice_frame_requisitar++;

    tempo_chegada_byte_serial = clock() + clocks_delay_bytes ;
    byte_pendente = 1;
}