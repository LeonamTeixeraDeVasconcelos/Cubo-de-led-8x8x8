import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import Efeito from './Efeito';

@Injectable({
  providedIn: 'root'
})
export class AppComponenteService {

  url: string;

  constructor(
    private http: HttpClient
  ) { 
    this.url = `${environment.api_url}`; 
  }

  buscarEfeitos() {
    return this.http.get<Array<Efeito>>(`${this.url}efeitos`);
  }

  reproduzirEfeito(id: number) {
    return this.http.get<Efeito>(`${this.url}reproduzir`, {
      params: new HttpParams().append('efeito_id', `${id}`)
    });
  }

  enviarNome(nome: string) {
    return this.http.get<Efeito>(`${this.url}create-from-text`, {
      params: new HttpParams().append('text', `${nome}`)
    });
  }
}
