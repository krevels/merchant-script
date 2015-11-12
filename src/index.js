import '../node_modules/animate.css/animate.css';
import '../node_modules/fancybox/dist/css/jquery.fancybox.css';
import './styles.css';
import $ from 'jquery';
import noty from 'noty';
import Fancybox from 'fancybox';
import uuid from 'node-uuid';
import Cookie from 'js-cookie';
import config from './config';

const fancybox = Fancybox($);

$( () => {
  const { amount, merchant, target, promptText, confirmText } = $('#SPARO-lib').data();

  setupFrameMessageListeners();
  triggerFlyover();

  $('.SPARO_notifier').on('click', openModal)
  $(document).on('click', '.SPARO_select_new_charity', openModal);


  function setupFrameMessageListeners() {
    $(window).on('message', (e) => {
      const message = e.originalEvent.data;
      if(message == 'close'){
        $.fancybox.close();
      }
      else if(message.startsWith('selected')){
        const [ , txid, charity_id, charity_name ] = message.split('|');
        (charity_id) ?
          generateCharitySelection(txid, charity_id, charity_name) : 
          removeCharitySelection();
      }
    });
  }

  function generateCharitySelection(txid, charity_id, charity_name) {
    const text = confirmText.replace('{{charity}}', charity_name) + ' <a class="SPARO_select_new_charity" href="#">Select a different charity</a>';
    
    $(`${target} .SPARO_charity_selection`).remove();
    $(target).append($('<div class="SPARO_charity_selection" />').html(text));

    Cookie.set('sparo_txid', txid);
    Cookie.set('sparo_charity', charity_id);
  }
  
  function removeCharitySelection() {
    $(`${target} .SPARO_charity_selection`).remove();
    Cookie.remove('sparo_txid');
    Cookie.remove('sparo_charity');
  }

  function triggerFlyover() {
    noty({
      layout: 'bottomRight',
      template: '<div class="noty_message SPARO_notifier"><span class="noty_text"></span><div class="noty_close"></div></div>',
      type: 'information',
      text: promptText,
      closeWith: ['click'],
      animation: {
        open: 'animated bounceInRight',
        easing: 'swing',
        speed: 500
      }
    });
  }

  function openModal() {
    $.fancybox({
      href: `${config.iframe_src}/${merchant}?amount=${amount}`,
      type: 'iframe',
      scrolling: 'no',
      width: 1000,
      height: 750,
      closeBtn: false,
      modal: true,
      padding: 10,
      margin: 5,
      aspectRatio: true,
      iframe: {
        scrolling: 'no',
        preload: true
      }
    });
  }
});






