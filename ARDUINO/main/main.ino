
/**
 * Porta de clock: 2
 * Porta de dados: 3
 */
 #define CLOCK_PIN 2
 #define DATA_PIN 3

 /**
  * Pinos de controle dos transistores das camadas
  */
 #define CAMADA_0_PIN 5
 #define CAMADA_1_PIN 6
 #define CAMADA_2_PIN 7
 #define CAMADA_3_PIN 8
 #define CAMADA_4_PIN 9
 #define CAMADA_5_PIN 10
 #define CAMADA_6_PIN 11
 #define CAMADA_7_PIN 12


/**
 * Dimensão linear
 */
#define MATX_SIZE  8


/**
 * Número de bytes por frame
 * Um frame é uma matriz completa. 
 * 
 * Como são 512 leds, são 512 bits de dados por frame,
 * e com isso, 64 bytes
 */
#define DATA_SIZE  64

/**
 * Tamanho do buffer
 */
//#define BUFF_SIZE  5




/**
 * =======================
 * Visualização de efeitos
 */

/**
 * Taxa de frames a ser exibida pelo Arduíno
 */
#define FRAME_RATE 70

/**
 * Tempo de espera para exibir o próximo frame
 */
#define DELAY_MS_BETWEEN_FRAMES (30 )



/**
 * ======================
 * Multiplexação
 */

/**
 * Taxa de multiplexação: Quantas multiplexaçõe completas devem ser feitas por segundo.
 * Influencia diretamente no tempo de alternância entre a ativação das camadas.
 * 
 * Uma multiplexação completa significa passagem completa por todos os estágios, ou seja
 * ativação anternada em todas as camadas
 */
#define MULTIPLEXING_RATE (20)
#define MULTIPLEXING_RATE_CLOCKS  (CLOCKS_PER_SEC / MULTIPLEXING_RATE)
#define MULTIPLEXING_RATE_TIME_MS (1000 / MULTIPLEXING_RATE)

//#define DELAY_US_BETWEEN_MULTIPLEXING_STEPS (900)

// Efeito fade
//#define DELAY_US_BETWEEN_MULTIPLEXING_STEPS (2100)


// Melhor ajuste
#define DELAY_US_BETWEEN_MULTIPLEXING_STEPS (1350)


//#define DELAY_US_BETWEEN_MULTIPLEXING_STEPS (500)


//#define DELAY_US_BETWEEN_MULTIPLEXING_STEPS (1200)


/**
 * Padrão:  [y][x][z]
 * 
 */
int matrix[MATX_SIZE][MATX_SIZE][MATX_SIZE];  

/**
 * Vetor que armazena os bytes em recebimento.
 * 
 * Os bytes são armazenados para que, ao completar o recebimento, 
 * os dados sejam inseridos na matriz de visualização
 */
char matrixReceiveBuffer[DATA_SIZE];



/**
 *  Variáveis de controle
 */

/**
 * Índice do próximo byte a ser recebido
 */
int indiceProximoByte = 0;


int camadaAtiva;


unsigned long time_ms_ultimo_frame;
unsigned long time_us_ultima_multiplexacao;



void setup() {
  pinMode(CLOCK_PIN, OUTPUT);
  pinMode(DATA_PIN, OUTPUT);
  
  pinMode(CAMADA_0_PIN, OUTPUT);
  pinMode(CAMADA_1_PIN, OUTPUT);
  pinMode(CAMADA_2_PIN, OUTPUT);
  pinMode(CAMADA_3_PIN, OUTPUT);
  pinMode(CAMADA_4_PIN, OUTPUT);
  pinMode(CAMADA_5_PIN, OUTPUT);
  pinMode(CAMADA_6_PIN, OUTPUT);
  pinMode(CAMADA_7_PIN, OUTPUT);
  

  time_ms_ultimo_frame = millis();
  time_us_ultima_multiplexacao = micros();
  


  /**
   * Porta serial
   */
  Serial.begin(57600); 
  
  /* -----------------------------------------
  * Preenche inicialmente matriz com todos leds ativos
  */
  for ( int x = 0; x < MATX_SIZE; ++x ) {   
    for ( int y = 0; y < MATX_SIZE; ++y ) {
      for ( int z = 0; z < MATX_SIZE; ++z ) {
        matrix[x][y][z] = 1;
      }
    }
  }

  
  camadaAtiva = 0;
  enviaRequisicaoProximoFrame();
}

void loop() {
//  multiplexa();

  /**
   * Comparo o tempo atual com o tempo em que ocorreu a última troca de fase
   * da multiplexação
   */
  unsigned long diff_time = micros() - time_us_ultima_multiplexacao;
  
  if(diff_time >= DELAY_US_BETWEEN_MULTIPLEXING_STEPS) {
    time_us_ultima_multiplexacao = micros();


    /**
     * Alterno a camada
     */
    desativaCamadas();
    envia_byte_camada(camadaAtiva);
    ativaCamada(camadaAtiva);

    camadaAtiva++;
    
    if(camadaAtiva >= 8)
      camadaAtiva = 0;

    
  }
    

  
  /**
   * Há novos dados em serial
   */
  if (Serial.peek() != -1) {
    dadoSerialRecebido( Serial.read() );
    
    
    if(indiceProximoByte == DATA_SIZE) {
      indiceProximoByte = 0;
      frameRecebido();

      
    }

    
  }


  /**
   * Requisição do próximo frame
   */
  diff_time = millis() - time_ms_ultimo_frame;
  
  if(diff_time >= DELAY_MS_BETWEEN_FRAMES) {
    time_ms_ultimo_frame = millis();

    enviaRequisicaoProximoFrame();
  }
}


void multiplexa() {
  
//  int dly =  MULTIPLEXING_RATE_TIME_MS / 8;
//  int dly = 5;


  for(int i = 0; i < MATX_SIZE; i++) {  
    desativaCamadas();
    envia_byte_camada(i);
    ativaCamada(i);
    
    delayMicroseconds(500);
  }  
}



/**
 * Handler do evento de receber um dado do servidor, via serial
 */
void dadoSerialRecebido(int data) {
  matrixReceiveBuffer[indiceProximoByte++] = data;
}

/**
 * Handler do evento de completar o recebimento de um frame 
 */
void frameRecebido() {
  
  /**
   * Índice do vetor de dados
   */
  int l = 0;

  /**
   * Iteração no eixo y (longitudinal)
   */
  for ( int y = 0; y < MATX_SIZE; ++y ) {
    /**
     * Iteração no eixo x (transversal)
     */
    for ( int x = 0; x < MATX_SIZE; ++x ) {
      /**
       * Iteração nas camadas
       */
      for ( int z = 0; z < MATX_SIZE; ++z ) {
        /**
         * Define o bit de cada LED na coluna de coordenadas (x, y)
         */
        matrix[y][x][MATX_SIZE - z - 1] = ( (matrixReceiveBuffer[l] >> z) & 0x01 );
      }
      
      l++;
    }
  } 
}


/**
 * Envia requisição de próximo frame para o servidor
 */
void enviaRequisicaoProximoFrame() {
  sendSerialMsg("request_new_frame");
}


/**
 * Envia uma mensagem serial, na seguinte estrutura em JSON:
 * 
 * { "msg": ${mensagem} }  
 */
void sendSerialMsg(String msg) {
  Serial.print(" { \"msg\": \"");
  Serial.print(msg);
  Serial.println("\" } ");
}




/**
 * Cada camada tem um byte: 64 bits = 64 leds
 * 
 * A função envia dados para os registradores, 
 * que alimentam os LED's de uma camada inteira
 */
void envia_byte_camada(int x) {
    
  for(int j = MATX_SIZE - 1; j >= 0; j--) {
    for(int i = MATX_SIZE - 1; i >= 0; i--) {
      /**
       * Envia bit atual para o DATA_PIN
       */
      digitalWrite(DATA_PIN, matrix[x][j][ i ]);

      /**
       * Pulso de clock, para armazenameno do bit enviado
       */
      digitalWrite(CLOCK_PIN, 1);
      digitalWrite(CLOCK_PIN, 0);      
    }
  }  
}


/**
 * Desativa os transistores de todas camadas
 */
void desativaCamadas() {
  digitalWrite(CAMADA_0_PIN, 0);
  digitalWrite(CAMADA_1_PIN, 0);
  digitalWrite(CAMADA_2_PIN, 0);
  digitalWrite(CAMADA_3_PIN, 0);
  digitalWrite(CAMADA_4_PIN, 0);
  digitalWrite(CAMADA_5_PIN, 0);
  digitalWrite(CAMADA_6_PIN, 0);
  digitalWrite(CAMADA_7_PIN, 0);
}


/**
 * Ativa os transistores de todas camadas
 */
void ativaCamada(int camada) {
  switch(camada) {
    case 0: digitalWrite(CAMADA_0_PIN, 1); break;
    case 1: digitalWrite(CAMADA_1_PIN, 1); break;
    case 2: digitalWrite(CAMADA_2_PIN, 1); break;
    case 3: digitalWrite(CAMADA_3_PIN, 1); break;
    case 4: digitalWrite(CAMADA_4_PIN, 1); break;
    case 5: digitalWrite(CAMADA_5_PIN, 1); break;
    case 6: digitalWrite(CAMADA_6_PIN, 1); break;
    case 7: digitalWrite(CAMADA_7_PIN, 1); break;
  }
}
