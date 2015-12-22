import '../node_modules/animate.css/animate.css';
import '../node_modules/fancybox/dist/css/jquery.fancybox.css';
import flyover_html from './html/flyover.html';
import confirmation_html from './html/confirmation.html';
import order_confirm_html from './html/order_confirmation.html';
import './css/styles.css';
import './css/flyover.css';
import './css/confirmation.css';
import $ from 'jquery';
import noty from 'noty';
import Fancybox from 'fancybox';
import uuid from 'node-uuid';

const fancybox = Fancybox($);

$( () => {
  const { amount, merchant, target, promptText, confirmText, action="select" } = $('#SPARO-lib').data();
  let merchant_obj;

  // TODO: check action
  const action_map = { select: checkExistingSelection, confirm: confirmCharity };

  $.ajax({
    url: TXAPI_URL + `/api/retailers/${merchant}`,
    dataType: 'jsonp',
    success: function(data) {
      if(typeof data.id == 'undefined'){
        return;
      }

      merchant_obj = data;
      action_map[action]();
    }
  });

  $(document).on('click', '.sparo-confirmation .confirmation-change', openModal);
  setupFrameMessageListeners();

  function confirmCharity() {
    // scan for values to submit
    const { selOrderNum, selOrderAmount, apiKey } = $("#SPARO-lib").data();

    openConfirmationFrame(
      apiKey,
      $(selOrderAmount).text(),
      $(selOrderNum).text(),
      merchant
    );
  }

  function openConfirmationFrame(apikey, amount, order_num) {
    if(!apikey || !amount) {
      return;
    }

    amount = amount.replace(/[^0-9.]/g,'');

    const qs = $.param({
      api_key: apikey,
      amount: amount,
      order_num: order_num,
      merchant: merchant
    });

    const frame = $('<iframe />').attr({ 
      src: (IFRAME_SRC + '/tx/confirm?' + qs),
      width: 0,
      height: 0,
      frameborder: 0,
      scrolling: 'no',
      seamless: 'seamless'
    });

    $('body').append(frame);
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
          generateCharitySelection(confirmation_html, charity_name, amount, charity_img) : 
          removeCharitySelection();
          $.fancybox.close();
      }
      else if(message.startsWith('confirm')){
        const [ , charity_name, amount, charity_img ] = message.split('|');
        generateCharitySelection(order_confirm_html, charity_name, amount, charity_img);
      }
      else if(message.startsWith('flyover')){
        triggerFlyover(merchant_obj.name, merchant_obj.pct_donation);
        $('.SPARO_notifier').on('click', () => {
          //$('.sparo-flyover-container').addClass('animated fadeout');
          openModal();
        });
      }
    });
  }

  function generateCharitySelection(text_tmpl, charity_name, amount, charity_img) {
    if(typeof target == 'undefined'){
      return;
    }

    const text = text_tmpl
      .replace(/%%amount%%/g, amount)
      .replace(/%%charity_name%%/g, charity_name)
      .replace(/%%charity_src%%/g, charity_img);

    $(`${target} .sparo-confirmation`).remove();
    $(target).append(text);
  }


  
  function removeCharitySelection() {
    $(`${target} .sparo-confirmation`).remove();
  }

  function triggerFlyover(name, pct_donation) {
    const text = flyover_html
      .replace('%%name%%', name)
      .replace('%%pct_donation%%', parseInt(pct_donation) + "%");

    $('body').append(text);
    $('.sparo-flyover').addClass('animated bounceInRight');
    $('.sparo-flyover .close-flyover').on('click', (e) => {
      e.stopPropagation();
      $('.sparo-flyover-container').addClass('animated fadeOut');
    });
  }

  function openModal() {
    $.fancybox({
      href: `${IFRAME_SRC}/${merchant}?amount=${amount}`,
      type: 'iframe',
      scrolling: 'no',
      width: 1000,
      height: 750,
      closeBtn: false,
      modal: true,
      padding: 10,
      margin: 5,
      /*aspectRatio: true,*/
      iframe: {
        scrolling: 'no',
        preload: true
      },
      afterLoad: function() {
        $('.sparo-flyover-container').fadeOut('slow');
      }
    });
  }

  function checkExistingSelection() {
    const frame = $('<iframe />').attr({
      src: `${IFRAME_SRC}/tx/charity_check/${merchant}?amount=${amount}`,
      width: 0,
      height: 0,
      frameborder: 0,
      scrolling: 'no',
      seamless: 'seamless'
    });

    $('body').append(frame);
  }
});






