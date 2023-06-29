import { Encontro } from './../../../../../../models/Encontro';
import { Component, OnInit } from '@angular/core';
import { DiaLetivo } from 'src/app/models/DiaLetivo';
import { DiaLetivoService } from 'src/app/services/dia-letivo.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { Atividade } from 'src/app/models/Atividade';
import { AtividadeService } from 'src/app/services/atividade.service';
import { DialogModule } from 'primeng/dialog';
import { BadgeModule } from 'primeng/badge';
import {  EventAttributes,DateArray  } from 'ics';


import { EstudantesService } from 'src/app/services/estudante.service';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';
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

  encontro = new Encontro;
  entregaTexto: string = ''


  idEstudanteUsuarioLogado : number;
  cdiasLetivos: DiaLetivo[];
  loading: boolean = true;

  minDate: any; //=  "2022-08-01T18:30:00.000Z";
  maxDate: any; //=  "2022-12-30T18:30:00.000Z";

  diasLetivos     : Date[]= [];
  inicioPeriodo   : Date[]= [];
  terminoPeriodo  : Date[]= [];
  diasFeriados    : Date[]= [];
  sabadoLetivo    : Date[]= [];
  diasNaoLetivos  : Date[]= [];
  recessoInstitucional  : Date[]= [];








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

      this.idEstudanteUsuarioLogado = this.authGuardService.getIdEstudanteUsuarioLogado();

    this.diaLetivoService.ObterCalendarioSemestreAtualByEstudanteId(this.idEstudanteUsuarioLogado).subscribe(resultado => {
      this.cdiasLetivos = resultado;

      this.minDate = this.cdiasLetivos[0].dialetivo;
      this.maxDate = this.cdiasLetivos[this.cdiasLetivos.length-1].dialetivo;

      this.cdiasLetivos .forEach(dia => {
          if(dia.periodoDiaTipoId == 1){
            this.diasLetivos.push(dia.dialetivo);
          }else if(dia.periodoDiaTipoId == 2){
            this.inicioPeriodo.push(dia.dialetivo);
          }else if(dia.periodoDiaTipoId == 3){
            this.terminoPeriodo.push(dia.dialetivo);
          }else if(dia.periodoDiaTipoId == 4){
            this.diasFeriados.push(dia.dialetivo);
          }else if(dia.periodoDiaTipoId == 5){
            this.sabadoLetivo.push(dia.dialetivo);
          }else if(dia.periodoDiaTipoId == 6){
            this.diasNaoLetivos.push(dia.dialetivo);
          }else if(dia.periodoDiaTipoId == 7){
            this.recessoInstitucional.push(dia.dialetivo);

          }
        }
      )
    });

    this.loading = false;


  }

  dateClass() {
    return (date: Date): MatCalendarCellCssClasses => {
      const letivo = this.diasLetivos
        .map(strDate => new Date(strDate))
        .some(d => d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear());
      const inicio = this.inicioPeriodo
        .map(strDate => new Date(strDate))
        .some(d => d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear());
      const termino = this.terminoPeriodo
        .map(strDate => new Date(strDate))
        .some(d => d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear());
      const feriado = this.diasFeriados
        .map(strDate => new Date(strDate))
        .some(d => d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear());
      const sabado = this.sabadoLetivo
        .map(strDate => new Date(strDate))
        .some(d => d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear());
      const naoletivo = this.diasLetivos
        .map(strDate => new Date(strDate))
        .some(d => d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear());
      const recesso = this.recessoInstitucional
        .map(strDate => new Date(strDate))
        .some(d => d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear());


        if (feriado){
          return 'dia-feriado' ;
        }
        else if (letivo){
          return 'dia-letivo' ;
        }
        else if (naoletivo){
          return 'dia-nao-letivo' ;
        }
        else if (inicio){
          return 'inicio-periodo' ;
        }
        else if (termino){
          return 'termino-periodo' ;
        }
        else if (sabado){
          return 'sabado-letivo' ;
        }
        else if (recesso){
          return 'recesso-institucional' ;
        }

        else{
          return '';
        }



    };
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



private createdTime = new Date().toISOString();
private startDate = new Date().toISOString();
private endDate = new Date().toISOString();





private calendarData = [
  'data:text/calendar;charset=utf8,',
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'BEGIN:VEVENT',
  'DESCRIPTION:' + this.encontro.descricao,
  'DTSTART:' + this.encontro.horaInicio,
  'DTEND:' + this.endDate,
  'LOCATION:' + this.encontro.local,
  'SUMMARY:',
  'TRANSP:TRANSPARENT',
  'END:VEVENT',
  'END:VCALENDAR',
  'UID:' + this.encontro.id,
  'DTSTAMP:',
  'PRODID:website-1.0'
].join('\n');


  // addToCalendar(): void {
  //   window.open(this.calendarData);
  // }


  addToCalendar(): void {
    if (!this.selected || !this.endDate) {
      return;
    }

    const event: EventAttributes = {
      start: this.getDateArray(this.selected),
      end: this.getDateArray(new Date(this.endDate)),
      title: this.mostrar(this.selected),
      location: this.encontro.local,
      uid: String(this.encontro.id)
    };

    const { error, value } = createEvent(event);
    if (error) {
      console.error('Erro ao criar evento:', error);
      return;
    }

    const encodedValue = encodeURIComponent(value as string);
    const link = 'data:text/calendar;charset=utf-8,' + encodedValue;
    const element = document.createElement('a');
    element.setAttribute('href', link);
    element.setAttribute('download', 'evento.ics');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  private getDateArray(date: Date): DateArray {
    return [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    ];
  }

}
