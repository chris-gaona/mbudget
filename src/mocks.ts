// IONIC:

export class ConfigMock {

  public get(): any {
    return '';
  }

  public getBoolean(): boolean {
    return true;
  }

  public getNumber(): number {
    return 1;
  }

  public _haptic(): any {
    return true;
  }
}

export class ViewControllerMock {

  public _setHeader(): any {
    return {}
  }

  public _setNavbar(): any {
    return {}
  };

  public _setIONContent(): any {
    return {}
  }

  public _setIONContentRef(): any {
    return {}
  }

  public dismiss(): any {
    return true;
  }
}

export class FormMock {
  public register(): any {
    return true;
  }
}

export class NavControllerMock {

  public pop(): any {
    return new Promise(function(resolve: Function): void {
      resolve();
    });
  }

  public push(): any {
    return new Promise(function(resolve: Function): void {
      resolve();
    });
  }

  public getActive(): any {
    return {
      'instance': {
        'model': 'something',
      },
    };
  }

  public setRoot(): any {
    return true;
  }
}

export class PlatformMock {
  public ready(): any {
    return new Promise((resolve: Function) => {
      resolve();
    });
  }

  public registerBackButtonAction(): any {
    return true;
  }
}

export class MenuMock {
  public close(): any {
    return new Promise((resolve: Function) => {
      resolve();
    });
  }
}

export class MockNavParams{
  data = {
  };

  get(param){
    return this.data[param];
  }
}

export class ToastControllerMock {
  public create(): any {
    return {
      present:() => {
        return true;
      }
    };
  }
}

export class ModalControllerMock {
  public create(): any {
    return {
      onDidDismiss: () => {
        return true;
      },
      present: () => {
        return true;
      }
    }
  }
}
