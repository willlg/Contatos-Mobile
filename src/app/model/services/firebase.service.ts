import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Contato from '../entities/Contato';
import { finalize } from 'rxjs/operators'
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private PATH : string = 'contatos';

  constructor(private firestore : AngularFirestore, private storage: AngularFireStorage) { }

  read(uid : string){
    return this.firestore.collection(this.PATH, ref=> ref.where('uid', '==', uid))
    .snapshotChanges();
  }

  create(contato: Contato){
    return this.firestore.collection(this.PATH)
    .add({nome: contato.nome, telefone: contato.telefone, uid: contato.id});
  }

  createWithImage(contato: Contato){
    return this.firestore.collection(this.PATH)
    .add({nome: contato.nome, telefone: contato.telefone, downloadURL : contato.downloadURL, uid: contato.id});
  }

  update(contato: Contato, id: string){
    return this.firestore.collection(this.PATH).doc(id)
    .update({nome: contato.nome, telefone: contato.telefone, uid: contato.id});
  }

  updateWithImage(contato: Contato, id: string){
    return this.firestore.collection(this.PATH).doc(id)
    .update({nome: contato.nome, telefone: contato.telefone, downloadURL : contato.downloadURL, uid: contato.id});
  }

  delete(contato: Contato){
    return this.firestore.collection(this.PATH)
    .doc(contato.id)
    .delete()
  }

  uploadImage(imagem: any, contato: Contato){
    const file = imagem.item(0);
    if(file.type.split('/')[0] !== 'image'){
      console.error('Tipo Não Suportado');
      return;
    }
    const path = `images/${contato.nome}_${file.name}`;
    const fileRef = this.storage.ref(path);
    let task = this.storage.upload(path, file);
    task.snapshotChanges().pipe(
    finalize(()=>{
      let uploadFileURL = fileRef.getDownloadURL();
      uploadFileURL.subscribe(resp=>{
        contato.downloadURL = resp;
        if(!contato.id){
          this.createWithImage(contato);
        }else{
          this.updateWithImage(contato, contato.id);
        }
      })
    })
  ).subscribe();
  }
}
