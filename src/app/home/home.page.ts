import { Component } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ToastController, LoadingController } from '@ionic/angular';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { GlobalService } from '../global/global.service';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers:[GlobalService]
})
export class HomePage {
  companyDetailsList: any = {
    id: "", from: "", to: "", description: "", companyName: "",
    datediff: {
      years: 0,
      months: 0,
      days: 0,
      message: ""
    }, isCurrent: 0
  }
  type: string = "list";
  texp: string
  addPageData: any = { from: "", to: "", description: "", companyName: "" }
  msg: string;
  year: number;
  count: any;
  isVisible = true;
  loading: HTMLIonLoadingElement
  test: string[];
  test1: any;
  constructor(private sqlite: SQLite, private router: Router,
    private toastController: ToastController, public loadingCtrl: LoadingController,
    private sqlitePorter: SQLitePorter, private _global: GlobalService
  ) {
  }

  async presentLoading(msg) {
    if (msg == '') {
      msg = 'Please wait...'
    }
    this.loading = await this.loadingCtrl.create({
      message: msg,
      spinner: 'crescent',
      duration: 2000
    });
    return await this.loading.present();
  }
  ionViewDidLoad() {
    this.isVisible = true;
    this.getData();
  }

  ionViewWillEnter() {
    this.isVisible = true;
    this.getData();
  }
  showmsg(msg = "Executed SQL") {
    this.msg = msg;
  }
  async db() {
    var db = await this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    })
    return db;
  }
  getData() {
    try {
      this.sqlite.create({
        name: 'ionicdb.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
        db.executeSql('CREATE TABLE IF NOT EXISTS companyDetails(id INTEGER PRIMARY KEY, [fromd] TEXT , [tod] TEXT , description TEXT , companyName TEXT,isCurrent INTEGER )', [])
          .then(res => {
            this.showmsg();

            this.BindData(db);
          })
          .catch(e => this.showmsg(e.message));
      })
    } catch (error) {
      this.showmsg(error.message);
    }
  }
  calulateExperience(tday, tmonth, tyear) {
    if (tday > 30) {
      var execmonth = (tday / 30).toString();
      var leftpart1 = parseInt(execmonth.split('.')[0])
      tmonth = tmonth + leftpart1;
      tday = Math.abs(tday - leftpart1 * 30);
    }
    if (tmonth > 12) {
      var execyear = (tmonth / 12).toString();
      var leftpart = parseInt(execyear.split('.')[0])
      tyear = tyear + leftpart;
      tmonth = Math.abs(tmonth - leftpart * 12);
    }
    ///
    this.texp = tyear + " years, " + tmonth + " months, " + tday + " days"
  }
  BindData(db) {
    db.executeSql('SELECT * FROM companyDetails ORDER BY id DESC', [])
      .then(res => {
        this.showmsg()
        this.count = res.rows.length
        this.companyDetailsList = []
        for (var i = 0; i < res.rows.length; i++) {
          var item = res.rows.item(i);
          if (item.isCurrent == 1) {
            item.tod = new Date().toISOString().slice(0, 10);
            item.companyName += "(current)"
          }
          res.rows.item(i).isCurrent = parseInt(res.rows.item(i).isCurrent);
          this.companyDetailsList.push({ id: item.id, from: item.fromd, to: item.tod, description: item.description, companyName: item.companyName, datediff: this.calcDate(item.fromd, item.tod), isCurrent: item.isCurrent })
        }
        var tmonth: number = 0;
        var tyear: number = 0;
        var tday: number = 0;
        this.companyDetailsList.forEach(element => {
          tyear += element.datediff.years
          tmonth += element.datediff.months
          tday += element.datediff.days
        });
        this.calulateExperience(tday, tmonth, tyear);
      })
      .catch(e => this.showmsg(e.message));
  }
  calcDate(from, to) {
    var message = "";
    var from1 = from.split('-')
    var to1 = to.split('-')
    var a = moment(to1);
    var b = moment(from1);
    var years = a.diff(b, 'year');
    b.add(years, 'years');
    var months = a.diff(b, 'months');
    b.add(months, 'months');
    var days = a.diff(b, 'days');
    if (years > 0) {
      message = years + ' years ' + months + ' months ' + days + ' days'
    }
    else {
      message = months + ' months ' + days + ' days'
    }
    return { years: years, months: months, days: days, message: message }
  }
  addData(obj) {
    try {
      this.sqlite.create({
        name: 'ionicdb.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
        db.executeSql('INSERT INTO companyDetails VALUES(NULL,?,?,?,?,?)',
          [obj.from, obj.to, obj.description, obj.companyName, 0])
          .then(res => {
            this.BindData(db);
            this.showmsg()
            this.presentToast('Experience added successfully')
          })
          .catch(e => this.showmsg(e.message));

      })
    } catch (error) {
      this.showmsg(error.message);
    }

  }
  viewpage(obj) {
    this.router.navigate(['details/' + obj.id]).then(x => { this.isVisible = false })
  }
  changePage(type) {
    this.type = type;
  }
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
  setclass(c) {
    if (c.isCurrent == 1) {
      return 'cardgold'
    }
  }
  cvparse() {
    this._global.cvparse();
    // this._global.cvparse();
  }
  importToDb() {
    this._global.importToDb(this);
  }
  exportToSql() {
    this._global.exportToSql();
  }
  
}
