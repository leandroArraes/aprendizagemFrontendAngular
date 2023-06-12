import { Component, OnInit } from '@angular/core';
import { DiaLetivo } from 'src/app/models/DiaLetivo';
import { DiaLetivoService } from 'src/app/services/dia-letivo.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { Atividade } from 'src/app/models/Atividade';
import { AtividadeService } from 'src/app/services/atividade.service';
import { DialogModule } from 'primeng/dialog';
import { BadgeModule } from 'primeng/badge';

import { createEvent } from 'ics';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {

  selected: Date | null;
  selectedActivity: string | null;
  atividades: Atividade[] = [];
  atencaoTotal : number;

  entregaTexto: string = ''




  constructor(
    private diaLetivoService: DiaLetivoService,
    private authGuardService: AuthGuardService,
    private atividadeService: AtividadeService
  ) {}




  ngOnInit(): void {
    this.atividadeService.ObterAtividadesRecentesPeloUsuarioId(this.authGuardService.getIdUsuarioLogado())
      .subscribe((atividades: Atividade[]) => {
        this.atividades = atividades;
        this.atencaoTotal= atividades.length;
      });


  }


  visible: boolean;

  showDialog() {
    this.visible = true;
}


mostrar(selected: Date): string {
  if (!selected) {
    return ''; // Retorna uma string vazia se a data selecionada for nula ou indefinida
  }

  const filteredActivities = this.atividades.filter(atividade => {
    const dataFimAtividade = new Date(atividade.dataFim);
    return dataFimAtividade > selected;
  });

  if (filteredActivities.length > 0) {
    const primeiraAtividade = filteredActivities[0];
    const dataFim = new Date(primeiraAtividade.dataFim);
    const dia = dataFim.getDate();
    const descricao = primeiraAtividade.descricao;

    // Retorna a string com o dia e a descrição da atividade
    return `${dia}/${dataFim.getMonth() + 1}/${dataFim.getFullYear()} - ${descricao}`;
  }

  // Retorna uma string vazia se não houver atividade para a data selecionada
  return '';
}



}
