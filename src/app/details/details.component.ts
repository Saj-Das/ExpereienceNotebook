import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  addPageData: any = { from: "", to: "", description: "", companyName: "", isCurrent: 0 }
  msg: string;
  eId: string;
  isCurrent = false;
  isVisible=true
  constructor(private route: ActivatedRoute, private sqlite: SQLite,
    private router: Router, private toastController: ToastController,
    private alertController: AlertController) { }

  ngOnInit() {
   this.isVisible=true
    this.eId = this.route.snapshot.paramMap.get("id")
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      this.BindData(db, this.eId)
    })

  }
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  showmsg(msg = "Executed SQL") {
    this.msg = msg;
  }
  deleteexp() {
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('delete FROM companyDetails where id=' + this.eId, [])
        .then(res => {
          this.presentToast('Experience deleted successfully')
          this.changePage();
        })
        .catch(e => this.showmsg(e.message));
    });
  }
  BindData(db, id) {
    db.executeSql('SELECT * FROM companyDetails where id=' + id, [])
      .then(res => {
        this.showmsg()
        res.rows.item(0).isCurrent=parseInt(res.rows.item(0).isCurrent);
        this.addPageData = { from: res.rows.item(0).fromd, to: res.rows.item(0).tod, description: res.rows.item(0).description, companyName: res.rows.item(0).companyName, isCurrent: res.rows.item(0).isCurrent }
       if(res.rows.item(0).isCurrent)
       {
        if (res.rows.item(0).isCurrent == 0) {
          this.isCurrent = false
        }
        else {
          this.isCurrent = true
        }
       }
       
      })
      .catch(e => this.showmsg(e.message));
  }
  editData(obj) {
    try {
      this.sqlite.create({
        name: 'ionicdb.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
        db.executeSql('update companyDetails set [fromd]=?,[tod]=?,description=?,companyName=? where id=?',
          [obj.from, obj.to, obj.description, obj.companyName, this.eId])
          .then(res => {
            this.showmsg()
            this.presentToast('Experience edited successfully')
          })
          .catch(e => this.showmsg(e.message));

      })
    } catch (error) {
      this.showmsg(error.message);
    }

  }
  changePage() {
    this.router.navigate(['']).then(x => { this.isVisible = false });
  }
  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Do you wish to delete this experience?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            // console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          handler: () => {
            this.deleteexp();
          }
        }
      ]
    });

    await alert.present();
  }
  setCurrent(event) {
    this.presentToast('Set as current organisation1')
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      if (this.isCurrent) {
        db.executeSql('update companyDetails set [isCurrent]=? where id=?',
        [1, this.eId])
        .then(res => {
          this.showmsg('organisation1')
          this.presentToast('Set as current organisation1')
        })
        .catch(e => this.showmsg(e.message));

        db.executeSql('update companyDetails set [isCurrent]=? where id!=?',
        [0, this.eId])
        .then(res => {
          this.showmsg('organisation')
          this.presentToast('Set as current organisation')
          // this.isCurrent = true;
        })
        .catch(e => this.showmsg(e.message));      
      }
      else {
        db.executeSql('update companyDetails set [isCurrent]=? where id=?',
          [0, this.eId])
          .then(res => {
            this.showmsg('Removed')
            this.presentToast('Removed as current organisation')
            // this.isCurrent = false
          })
          .catch(e => this.showmsg(e.message));
      }


    })

  }
}
