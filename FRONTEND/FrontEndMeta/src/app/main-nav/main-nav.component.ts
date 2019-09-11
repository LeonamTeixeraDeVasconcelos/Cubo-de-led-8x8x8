import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import Efeito from '../Efeito';
import { AppComponenteService } from '../app-componente.service';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent implements OnInit {

  efeitos: Efeito[];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private appService: AppComponenteService
  ) { }


  ngOnInit() {
    this.appService.buscarEfeitos().subscribe(
      (efeitos: Efeito[]) => {
        this.efeitos = efeitos;
    });
  }

  efeitoSelecionado(efeito: Efeito) {
    if(efeito.nome == 'nome') {
        const nome = prompt('Digite seu nome');
        console.log(nome);



        // console.log(efeito); // efeito selecionado no menu de efeitos prontos
        this.appService.enviarNome(nome).subscribe(
            (message: any) => {
            // console.log(message.message); // reposta do servidor a requisicao
            }
        )
    } else {


        // console.log(efeito); // efeito selecionado no menu de efeitos prontos
        this.appService.reproduzirEfeito(efeito.codigo).subscribe(
            (message: any) => {
            // console.log(message.message); // reposta do servidor a requisicao
            }
        )
    }
  }

}
