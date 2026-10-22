def check(description,condition)
    if condition
        puts "OK, #{description}"
    else
        puts "FAILED, #{description}"
    end
end

def check_error(description)
    begin
        yield
        puts "FAILED, #{description}"
    rescue ArgumentError => e
        puts "OK, #{e.message}, with description of: #{description}"
    rescue
        puts "FAILED, #{e.class}"
    end
end



def split_installments(total_cents,count)
    raise ArgumentError, "Count need to be Integer. Count: #{count}" unless count.is_a?(Integer) 
    
    raise ArgumentError, "Count need to be greater than or equal to 1. Count: #{count}" if count < 1

    raise ArgumentError, "total cents need to be positive" if total_cents < 0
    
    raise ArgumentError, "total cents need to be greater than count" if total_cents < count

    installments_value = total_cents / count # O ruby automaticamente faz uma divisão inteira e arrendonda para baixo, não necessitando de .floor

    rest_cents = total_cents % count

    Array.new(count) {|i| installments_value + (i < rest_cents ? 1 : 0)}

end

def installments(total_cents,count)

    split_installments(total_cents,count).map.with_index(1) do |value,number|
      {
        number: number,
        installment: value
      }
    end

end