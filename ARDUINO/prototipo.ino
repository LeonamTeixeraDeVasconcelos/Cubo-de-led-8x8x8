#define MATX_SIZE  8
#define DATA_SIZE  64
#define BUFF_SIZE  5

bool matrix[MATX_SIZE][MATX_SIZE][MATX_SIZE], controle;
char data_array[DATA_SIZE];
char read_data;
int  x, y, z, l, cont;

void setup() {
  x = 0; // Coordenada x
  y = 0; // Coordenada y
  z = 0; // Coordenada z
  l = 0; // Contador auxiliar

  
  controle = true; // Boolean pra preencher a matriz inicialmente
  Serial.begin(9600); // Abre Serial
  Serial.println("aberto"); // Escreve mensagem de verificação
  
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
  /*
   * ----------------------------------------
   */
}

void loop() {
  /* ---------------------------------------
   * Espera alguma coisa ser transmitida
   */
  cont = Serial.peek();
  if (cont == -1)
    Serial.println("esperando...");
  while ( cont == -1 )  {
    cont = Serial.peek();
  }
  /*
   * ----------------------------------------
   */
   
  /* ----------------------------------------
   * Lê os dados sendo transmitidos e coloca
   * no array de dados
   */
  for ( l = 0; l < DATA_SIZE; l++ ) {
     if (Serial.available()) {
        read_data = Serial.read();
        data_array[l] = read_data;
     }
  }
  /*
   * ----------------------------------------
   */

  /* ----------------------------------------
   * Varre a matriz preenchendo a com os dados
   * do array:
   * 
   * A dimensão y varia menos que as dimensões
   * x e z como foi convencionado no lab, por 
   * isso o for mais aninhado representa a vari-
   * ação em z (a que mais varia), o for do meio
   * representa a variação em x;
   */
  for ( y = 0; y < MATX_SIZE; ++y ) {
    l = 0; // Inicia contador do vetor de dados
    for ( x = 0; x < MATX_SIZE; ++x ) { 
      for ( z = 0; z < MATX_SIZE; ++z ) {
        /*
         *  Pega bit por bit do dado lido;
         *  TEM QUE VERIFICAR ESSA PARTE:
         *  
         *  MANDEI UM ARRAY DE 64 CARACTERES A's: 
         *  
         *  let transmission_data = [
         *     'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'
         *  ];
         *  
         *  e ele printou:
         *  
         *  [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] 
         *  [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] 
         *  [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] 
         *  [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] 
         *  [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] 
         *  [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] 
         *  [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] 
         *  [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] [ t f f f f f t f ] [ f t f t f f f f ] 
         *  
         *  
         */
        matrix[x][y][MATX_SIZE - z - 1] = (( data_array[l] >> z ) & 0x01 );
      }
      l++;
    }
  } 
  // printa os dados
  for ( x = 0; x < MATX_SIZE; ++x ) {
    for ( y = 0; y < MATX_SIZE; ++y ) {
      for ( z = 0; z < MATX_SIZE; ++z ) {
        Serial.print("{[");
        Serial.print(x);
        Serial.print("-");
        Serial.print(y);
        Serial.print("-");
        Serial.print(z);
        Serial.print("] = ");
        if ( matrix[x][y][z] ) {
          Serial.print("t} ");
        } else {
          Serial.print("f} ");
        }
        // Deleizin bobo
        delay(100);
      }
      Serial.println("");
    }
  }
}
