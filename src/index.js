import '../node_modules/animate.css/animate.css';
import '../node_modules/fancybox/dist/css/jquery.fancybox.css';
import flyover_html from './html/flyover.html';
import confirmation_html from './html/confirmation.html';
import './css/foundation.css';
import './css/styles.css';
import './css/flyover.css';
import './css/confirmation.css';
import $ from 'jquery';
import noty from 'noty';
import Fancybox from 'fancybox';
import uuid from 'node-uuid';
import config from './config';

const fancybox = Fancybox($);

$( () => {
  const { amount, merchant, target, promptText, confirmText, action="select" } = $('#SPARO-lib').data();

  // TODO: check action
  const action_map = { select: selectCharity, confirm: confirmCharity };

  action_map[action]();

  setupFrameMessageListeners();

  function confirmCharity() {
    // scan for values to submit
    const { selOrderNum, selOrderAmount, apiKey } = $("#SPARO-lib").data();

    openConfirmationFrame(
      apiKey,
      $(selOrderAmount).text(),
      $(selOrderNum).text()
    );

  }

  function openConfirmationFrame(apikey, amount, order_num) {
    if(!apikey || !amount) {
      return;
    }

    const qs = `?api_key=${apikey}&amount=${amount}&order_num=${order_num}`;

    const frame = $('<iframe />').attr({ 
      src: (config.iframe_src + '/confirm' + qs),
      width: 0,
      height: 0,
      frameborder: 0,
      scrolling: 'no',
      seamless: 'seamless'
    });

    $(body).append(frame);
  }

  function selectCharity() {
    triggerFlyover();
    $('.SPARO_notifier').on('click', () => {
      openModal();
      $('.sparo-flyover-container').addClass('animated fadeout');
    });
    $(document).on('click', '.sparo-confirmation .confirmation-change', openModal);
  }


  function setupFrameMessageListeners() {
    $(window).on('message', (e) => {
      const message = e.originalEvent.data;
      if(message == 'close'){
        $.fancybox.close();
      }
      else if(message.startsWith('selected')){
        const [ , txid, charity_id, charity_name, amount, charity_img ] = message.split('|');
        (charity_id) ?
          generateCharitySelection(txid, charity_id, charity_name, amount, charity_img) : 
          removeCharitySelection();
          $.fancybox.close();
      }
    });
  }

  function generateCharitySelection(txid, charity_id, charity_name, amount, charity_img) {
    const text = confirmation_html
      .replace('%%amount%%', amount)
      .replace('%%charity_src%%', charity_img);

    $(`${target} .sparo-confirmation`).remove();
    $(target).append(text);
  }
  
  function removeCharitySelection() {
    $(`${target} .sparo-confirmation`).remove();
  }

  function triggerFlyover() {
    $('body').append(flyover_html);
    $('.sparo-flyover').addClass('animated bounceInRight');
    $('.sparo-flyover .close-flyover').on('click', (e) => {
      e.stopPropagation();
      $('.sparo-flyover-container').addClass('animated fadeout');
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






