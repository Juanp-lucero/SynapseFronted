import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { GraphService } from '../../core/services/graph';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './graph.html',
  styleUrl: './graph.scss'
})
export class Graph {

  graphData: any = null;

  constructor(
    private graphService: GraphService
  ) {}

  loadGraph(): void {

    const token = localStorage.getItem(
      'access_token'
    );

    if (!token) {
      console.error(
        'No existe un token de autenticación'
      );

      return;
    }

    const sourceId = 4;

    this.graphService
      .getSourceGraph(
        sourceId,
        token
      )
      .subscribe({
        next: (data: any) => {

          console.log(
            'Datos del grafo:',
            data
          );

          this.graphData = data;
        },

        error: (error: any) => {

          console.error(
            'Error obteniendo el grafo:',
            error
          );
        }
      });
  }
}