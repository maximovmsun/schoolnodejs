var MyForm = {
    fieldNames: ['phone', 'fio', 'email'],

    validators: {
        'phone': function (value) {
            if (!value) {
                return false;
            }

            // проверяем формат номера +7(999)999-99-99
            if (!/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(value)) {
                return false;
            }

            // сумма цифр номера не должна превышать 30
            var digitSum = value.match(/\d/g).reduce(function (previousValue, currentValue) { return previousValue + parseInt(currentValue, 10) }, 0);

            return digitSum <= 30;
        },

        'fio': function (value) {
            // ФИО должно состоять ровно из 3-х слов
            return value && /^\s*\S+\s+\S+\s+\S\s*$/.test(value);
        },

        'email': function (value) {
            // email в одном из доменов yandex
            return value && /^[-a-z0-9!#$%&'*+/=?^_`{|}~]+(\.[-a-z0-9!#$%&'*+/=?^_`{|}~]+)*@(ya\.ru|yandex\.ru|yandex\.ua|yandex\.by|yandex\.kz|yandex\.com)$/.test(value);
        },
    },

    validate: function () {
        var myFormData = MyForm.getData();

        var result = { isValid: true, errorFields: [] };

        for (var i = 0; i < MyForm.fieldNames.length; i++) {
            var fieldName = MyForm.fieldNames[i];
            if (typeof (MyForm.validators[fieldName]) == 'function' && !MyForm.validators[fieldName](myFormData[fieldName])) {
                result.isValid = false;
                result.errorFields.push(fieldName);
            }
        }

        return result;
    },

    getData: function () {
        var myFormSerializedArray = $('#myForm').serializeArray();

        // преобразуем массив с данными формы в объект, где имена свойств совпадают с именами инпутов
        var result = {};
        for (var i = 0; i < myFormSerializedArray.length; i++) {
            result[myFormSerializedArray[i].name] = myFormSerializedArray[i].value;
        }

        return result;
    },

    setData: function (data) {
        for (var i = 0; i < MyForm.fieldNames.length; i++) {
            $("[name='" + MyForm.fieldNames[i] + "']").val(data[MyForm.fieldNames[i]]);
        }
    },

    submit: function () {
        var validationResult = MyForm.validate();

        $('#myForm input').removeClass('error');
        $('#resultContainer').removeClass('success error progress').text('');

        if (!validationResult.isValid) {
            var fieldSelector = validationResult.errorFields.map(function (fieldName) { return "[name='" + fieldName + "']" }).join(', ');
            $(fieldSelector).addClass('error');

            return;
        }

        $('#submitButton').attr('disabled', true);

        var formAction = $('#myForm').attr('action');
        var myFormData = MyForm.getData();
        $.ajax({
            method: 'GET', //по хорошему должен быть POST, но веб-сервер не позволял делать POST-запросы к статическим json-файлам 
            url: formAction,
            data: myFormData,
            cache: false
        })
        .done(function (data, textStatus, jqXHR) {
            if (data.status === 'success') {
                $('#resultContainer')
                    .addClass('success')
                    .text('Success');

                $('#submitButton').attr('disabled', false);
            }
            else if (data.status === 'error') {
                $('#resultContainer')
                    .addClass('error')
                    .text(data.reason);

                $('#submitButton').attr('disabled', false);
            }
            else if (data.status === 'progress') {
                $('#resultContainer')
                    .addClass('progress')
                    .text('In progress...');

                setTimeout(function () {
                    MyForm.submit();
                }, data.timeout);
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $('#resultContainer')
                .addClass('error')
                .text(errorThrown);

            $('#submitButton').attr('disabled', false);
        });
    }
}

$(function () {
    $('#myForm').submit(function (event) {
        MyForm.submit();

        event.preventDefault();
    })
});