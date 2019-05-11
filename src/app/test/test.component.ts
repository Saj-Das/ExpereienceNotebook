import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  from:""
  constructor() { }

  ngOnInit() {
  }
  dsf()
  {
    debugger
    console.log(this.from)
  }

  setclass(c) {
    
      return 'cardgold'
    
}
}